#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <time.h>

// ================= WIFI =================
const char* ssid = "Infinixz";
const char* password = "1234567891011";

// ================= API ==================
const char* turbidityUrl = "http://10.146.77.144:3000/api/turbidity/log";
const char* relayStatusUrl = "http://10.146.77.144:3000/api/relay/status";
const char* feederScheduleUrl = "http://10.146.77.144:3000/api/feeder/schedule";
const char* feederUrl = "http://10.146.77.144:3000/api/feeder";
const char* autoStatusUrl = "http://10.146.77.144:3000/api/auto/status";
const char* manualRelayUrl = "http://10.146.77.144:3000/api/manual-relay/status";

// ================= PIN =================
#define TURBIDITY_PIN 35
#define TRIG_PIN 32
#define ECHO_PIN 33
#define SERVO_PIN 27
#define RELAY_DRAIN 26
#define RELAY_FILL 25

Servo feederServo;

// ================= TURBIDITY ============
int jernihADC = 3200;
int keruhADC  = 1500;

// ================= VARIABLE =============
unsigned long lastTurbidityMillis = 0;
unsigned long lastRelayMillis = 0;
unsigned long lastFeederMillis = 0;
unsigned long lastWaterMillis = 0;

const unsigned long turbidityInterval = 5000;
const unsigned long relayInterval     = 3000;
const unsigned long feederInterval    = 10000;
const unsigned long waterInterval = 5000;

String lastFedTime = "";

bool manualDrain = false;
bool manualFill = false;

bool autoDrain = false;
bool autoFill = false;

bool drainRunning = false;
bool fillRunning = false;

// ================= TIME =================
void setupTime() {
  configTime(7 * 3600, 0, "pool.ntp.org");
}

String getCurrentTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "00:00";

  char timeString[6];
  strftime(timeString, sizeof(timeString), "%H:%M", &timeinfo);
  return String(timeString);
}

// ================= TURBIDITY =================
int bacaTurbidity() {
  long total = 0;
  for (int i = 0; i < 50; i++) {
    total += analogRead(TURBIDITY_PIN);
    delay(5);
  }
  return total / 50;
}

// ================= ULTRASONIK =================
float bacaJarak() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) return -1;

  return duration * 0.034 / 2;
}

// ================= KIRIM DATA =================
void kirimTurbidity(int nilai) {
  HTTPClient http;

  http.begin(turbidityUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"turbidity\":" + String(nilai) + "}";
  int httpCode = http.POST(payload);

  // 🔥 OUTPUT YANG JELAS
  Serial.print("Status HTTP: ");
  Serial.println(httpCode);

  Serial.print("Nilai dikirim: ");
  Serial.println(nilai);

  http.end();
}

void kirimWaterLevel(float jarak) {
  HTTPClient http;

  http.begin("http://10.146.77.144:3000/api/water/log");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"value\":" + String(jarak) + "}";
  http.POST(payload);

  http.end();
}

// ================= MANUALRELAY =================
void cekManualRelay() {

    HTTPClient http;

    http.begin(manualRelayUrl);

    int httpCode =
    http.GET();

    if(httpCode == 200){

        String response =
        http.getString();

        // DRAIN
        if(response.indexOf("\"drain\":1") >= 0){

            Serial.println("MANUAL DRAIN ON");

            digitalWrite(RELAY_DRAIN,HIGH);

        }else{

            digitalWrite(RELAY_DRAIN,LOW);

        }

        // FILL
        if(response.indexOf("\"fill\":1") >= 0){

            Serial.println("MANUAL FILL ON");

            digitalWrite(RELAY_FILL,HIGH);

        }else{

            digitalWrite(RELAY_FILL,LOW);

        }

    }

    http.end();

}

// ================= RELAY =================
void cekRelayStatus() {

    int adcValue = bacaTurbidity();

    int persenKeruh =
    map(adcValue, jernihADC, keruhADC, 0, 100);

    persenKeruh =
    constrain(persenKeruh,0,100);

    float jarak = bacaJarak();

    // ===========================
    // MANUAL DRAIN
    // ===========================

    if(manualDrain){

        Serial.println("MANUAL DRAIN");

        digitalWrite(RELAY_DRAIN,HIGH);
        digitalWrite(RELAY_FILL,LOW);

        return;

    }

    // ===========================
    // MANUAL FILL
    // ===========================

    if(manualFill){

        Serial.println("MANUAL FILL");

        digitalWrite(RELAY_DRAIN,LOW);
        digitalWrite(RELAY_FILL,HIGH);

        return;

    }

    // ===========================
    // AUTO DRAIN
    // ===========================

    if (autoDrain && persenKeruh > 80 && jarak <= 5 && !drainRunning) {

        drainRunning = true;

    }

    // Selama drain
    if (drainRunning) {

        digitalWrite(RELAY_DRAIN, HIGH);
        digitalWrite(RELAY_FILL, LOW);

        if (jarak >= 20) {

            digitalWrite(RELAY_DRAIN, LOW);

            drainRunning = false;

            Serial.println("Drain selesai");

        }

        return;

    }

    // ===========================
    // AUTO FILL
    // ===========================

    if (autoFill && jarak >= 20 && !fillRunning) {

        fillRunning = true;

    }

    // Selama fill
    if (fillRunning) {

        digitalWrite(RELAY_DRAIN, LOW);
        digitalWrite(RELAY_FILL, HIGH);

        if (jarak <= 5) {

            digitalWrite(RELAY_FILL, LOW);

            fillRunning = false;

            Serial.println("Fill selesai");

        }

        return;

    }

    // ===========================
    // SEMUA OFF
    // ===========================

    digitalWrite(RELAY_DRAIN,LOW);
    digitalWrite(RELAY_FILL,LOW);

}

// ================= FEEDER =================
void cekFeederSchedule() {

  HTTPClient http;

  http.begin(feederScheduleUrl);

  int httpCode = http.GET();

  Serial.print("HTTP CODE: ");
  Serial.println(httpCode);

  if (httpCode == 200) {

    String response = http.getString();

    Serial.println("JADWAL DARI SERVER:");
    Serial.println(response);

    String nowTime = getCurrentTime();

    Serial.print("JAM SEKARANG: ");
    Serial.println(nowTime);

    if (response.indexOf(nowTime) >= 0 &&
        nowTime != lastFedTime) {

      Serial.println("WAKTUNYA MAKAN!");

      feederServo.write(90);
      delay(3000);
      feederServo.write(0);

      lastFedTime = nowTime;
    }
  }

  http.end();
}

void cekFeedManual() {
  HTTPClient http;
  http.begin(feederUrl);
  
  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();
    Serial.println(response);

    if (response.indexOf("\"feed\":1") >= 0) {
      Serial.println("FEED MANUAL!");

      // GERAKKAN SERVO
      feederServo.write(90);
      delay(2000);
      feederServo.write(0);

      // 🔥 RESET KE SERVER
      HTTPClient httpReset;
      httpReset.begin("http://10.146.77.144:3000/api/feeder/reset");
      httpReset.POST("");
      httpReset.end();

      Serial.println("FEED RESET");
    }
  }

  http.end();
}

// ================= CHECK =================
void cekAutoStatus() {

    Serial.println("CEK AUTO STATUS");

    HTTPClient http;

    http.begin(autoStatusUrl);

    int httpCode = http.GET();

    if (httpCode == 200) {

        String response = http.getString();

        Serial.println("=== RESPONSE ===");
        Serial.println(response);

        if (response.indexOf("\"auto_drain\":1") >= 0) {

            autoDrain = true;

        } else {

            autoDrain = false;

        }

        if (response.indexOf("\"auto_fill\":1") >= 0) {

            autoFill = true;

        } else {

            autoFill = false;

        }

    }

    http.end();

    Serial.print("Auto Drain: ");
    Serial.println(autoDrain);

    Serial.print("Auto Fill: ");
    Serial.println(autoFill);

}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial.println("START PROGRAM");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_DRAIN, OUTPUT);
  pinMode(RELAY_FILL, OUTPUT);

  // relay OFF awal
  digitalWrite(RELAY_DRAIN, LOW);
  digitalWrite(RELAY_FILL, LOW);

  feederServo.attach(SERVO_PIN);
  feederServo.write(0);

  analogReadResolution(12);

  // WiFi connect
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");

  setupTime();
}

// ================= LOOP =================
void loop() {
  unsigned long currentMillis = millis();

  Serial.println("===== LOOP =====");

  // ===== TURBIDITY =====
  if (currentMillis - lastTurbidityMillis >= turbidityInterval) {
    lastTurbidityMillis = currentMillis;

    int adcValue = bacaTurbidity();
    int persenKeruh = map(adcValue, jernihADC, keruhADC, 0, 100);
    persenKeruh = constrain(persenKeruh, 0, 100);

    Serial.printf("Turbidity: %d%%\n", persenKeruh);

    kirimTurbidity(persenKeruh);
  }

  // ===== ULTRASONIK =====
  if (currentMillis - lastWaterMillis >= waterInterval) {

    lastWaterMillis = currentMillis;

    float jarak = bacaJarak();

    kirimWaterLevel(jarak);

  }

  // ===== RELAY =====
  if (currentMillis - lastRelayMillis >= relayInterval) {

    lastRelayMillis = currentMillis;

    cekAutoStatus();

    cekRelayStatus();

    cekManualRelay();

  }

  // ===== FEEDER =====
  if (currentMillis - lastFeederMillis >= feederInterval) {
    lastFeederMillis = currentMillis;
    cekFeederSchedule();
    cekFeedManual();
  }

  delay(1000);
}
