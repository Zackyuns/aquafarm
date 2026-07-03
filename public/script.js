document.addEventListener("DOMContentLoaded", function () {
  const role = localStorage.getItem("role");

  console.log("Role:", role);

  if (role !== "owner") {
    document.getElementById("addScheduleBtn")?.remove();
  }

  if (role !== "owner") {
    document.getElementById("btnSolenoidOn")?.remove();
    document.getElementById("btnSolenoidOff")?.remove();
  }

  document.getElementById("userRole").innerText =
  role === "owner" ? "Pemilik Kolam" : "Penjaga Kolam";

  if (!role) {
    window.location.href = "login.html";
  }
  // ==========================================
  // 1. KONFIGURASI API
  // ==========================================

  const BASE_URL = "http://10.146.77.144:3000";

  const API_URLS = {
    monitor: `${BASE_URL}/api/feeder/data?limit=1`,
    schedule: `${BASE_URL}/api/feeder/schedule`,

    // Turbidity
    turbidity: `${BASE_URL}/api/turbidity/latest`,

    // Relay
    relayOn: `${BASE_URL}/api/relay/on`,
    relayOff: `${BASE_URL}/api/relay/off`,
    relayStatus: `${BASE_URL}/api/relay/status`
  };


  // ==========================================
  // 2. ELEMENT SELECTORS
  // ==========================================

  const menuToggle = document.getElementById("mobileMenuBtn"); // Updated ID
  const sidebar = document.getElementById("sidebar"); // Updated ID
  const overlay = document.getElementById("sidebarOverlay"); // Updated ID
  const container = document.querySelector(".main-wrapper");

  // Monitoring
  const displayTurbidity =
  document.getElementById('displayTurbidity');

  const cardTurbidity =
  document.getElementById('cardSuhu');
  const statusText = document.getElementById('statusText');
  const statusIcon = document.getElementById('statusIcon');

  const servoStatusText = document.getElementById('feederStatusText'); // Reusing existing ID logic
  const feederToggle = document.getElementById('feederToggle');

  // Schedule
  const addBtn = document.getElementById("addScheduleBtn");
  const scheduleList = document.getElementById("scheduleList");

  // Modal Elements
  const modal = document.getElementById('addScheduleModal');
  const inputName = document.getElementById('inputName');
  const inputTime = document.getElementById('inputTime');
  const btnSaveSchedule = document.getElementById('btnSaveSchedule');
  const btnCancelModal = document.getElementById('btnCancelModal');

  // Turbidity
  const turbidityValue = document.getElementById("displayTurbidity");
  const turbidityStatus = document.getElementById("turbidityStatus");

  // Solenoid
  const btnSolenoidOn = document.getElementById("btnSolenoidOn");
  const btnSolenoidOff = document.getElementById("btnSolenoidOff");
  const solenoidStatus = document.getElementById("solenoidStatus");

  // Chart Context
  const ctx = document.getElementById('realtimeChart')?.getContext('2d');


  // ==========================================
  // STATE
  // ==========================================

  let schedules = [];
  let visualHoldTimeout = null;
  let realtimeChart = null; // Chart instance


  // ==========================================
  // 3. SIDEBAR & UI INTERACTION
  // ==========================================

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  async function loadAutoStatus() {

    try {

        const res =
        await fetch("/api/auto/status");

        const data =
        await res.json();

        const drainSwitch =
        document.getElementById(
            "autoDrainSwitch"
        );

        if (drainSwitch) {

            drainSwitch.checked =
            data.auto_drain == 1;

        }

        const fillSwitch =
        document.getElementById(
            "autoFillSwitch"
        );

        if (fillSwitch) {

            fillSwitch.checked =
            data.auto_fill == 1;

        }

    }
    catch(err){

        console.log(err);

    }

}

  // ==========================================
  // 4. CHART INITIALIZATION
  // ==========================================

  function initChart() {
    if (!ctx) return;

    const initialData = {
      labels: [],
      datasets: [{
        label: 'Kekeruhan (%)',
        data: [],
        borderColor: '#0066FF',
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0066FF',
        fill: true,
        tension: 0.4
      }]
    };

    realtimeChart = new Chart(ctx, {
      type: 'line',
      data: initialData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: false,
            beginAtZero: true,
            max: 100,
            grid: { borderDash: [5, 5] }
          }
        },
        animation: { duration: 800 }
      }
    });
  }

  initChart();


  // ==========================================
  // 5. SCHEDULE LOGIC
  // ==========================================

  async function loadSchedulesFromServer() {
    try {
      const res = await fetch(API_URLS.schedule, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!res.ok) return;

      const result = await res.json();

      if (Array.isArray(result.schedules)) {
        schedules = result.schedules;
        updateScheduleUI();
      }
    } catch (err) {
      console.error("Schedule error:", err);
    }
  }

  async function saveSchedulesToServer() {
    try {
      await fetch(API_URLS.schedule, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ schedules })
      });
    } catch (err) {
      alert("Gagal menyimpan jadwal ke server.");
      console.error(err);
    }
  }

  function getGreetingTime(timeStr) {
    if (!timeStr) return "Pakan Otomatis";
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour >= 5 && hour < 11) return "Pakan Pagi";
    if (hour >= 11 && hour < 15) return "Pakan Siang";
    if (hour >= 15 && hour < 18) return "Pakan Sore";
    return "Pakan Malam";
  }

  function updateScheduleUI() {
    if (!scheduleList) return;
    scheduleList.innerHTML = "";

    schedules.sort();

    if (schedules.length === 0) {
      scheduleList.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--secondary);">Belum ada jadwal.</div>`;
      return;
    }

    schedules.forEach((time, index) => {
      const displayTitle = getGreetingTime(time);

      const itemHTML = `
        <div class="schedule-item">
            <div style="display:flex; gap: 15px; align-items: center;">
                <span class="time-badge">${time}</span>
                <div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${displayTitle}</div>
                </div>
            </div>
            <div style="display:flex; gap: 10px; align-items: center;">
                <button class="btn-delete" data-index="${index}" title="Hapus Jadwal">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
      `;

      scheduleList.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        // Prevent bubbling to switch if any
        e.stopPropagation();

        if (!confirm("Hapus jadwal ini?")) return;

        const idx = btn.getAttribute("data-index");
        schedules.splice(idx, 1);

        updateScheduleUI();
        await saveSchedulesToServer();
      });
    });
  }

  // Modal Handlers
  function openModal() {
    if (modal) {
      modal.classList.add('active');
      if (inputName) inputName.value = '';
      if (inputTime) inputTime.value = '';
    }
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (addBtn) {
    addBtn.addEventListener('click', openModal);
  }

  if (btnCancelModal) {
    btnCancelModal.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnSaveSchedule) {
    btnSaveSchedule.addEventListener('click', async () => {
      const time = inputTime.value;
      // Name is ignored for backend as it only supports time, 
      // but we keep the input for user experience consistency in the implemented UI.

      if (!time) {
        alert("Mohon pilih waktu.");
        return;
      }

      if (schedules.includes(time)) {
        alert("Jadwal dengan waktu ini sudah ada.");
        return;
      }

      schedules.push(time);
      updateScheduleUI();
      await saveSchedulesToServer();
      closeModal();
    });
  }


  // ==========================================
  // 6. MONITORING DATA LOGIC
  // ==========================================

  function updateDashboard(turbidity) {

    if (displayTurbidity) {
      displayTurbidity.innerText = turbidity;
    }
  
    if (cardTurbidity && statusText && statusIcon) {
  
      if (turbidity < 30) {
  
        statusText.innerText = "Air Jernih";
        statusIcon.className =
        "fa-solid fa-circle-check";
  
      }
  
      else if (turbidity < 70) {
  
        statusText.innerText = "Sedang";
        statusIcon.className =
        "fa-solid fa-circle-exclamation";
  
      }
  
      else {
  
        statusText.innerText = "Air Keruh";
        statusIcon.className =
        "fa-solid fa-triangle-exclamation";
  
      }
  
    }
  
    // UPDATE CHART
    if (realtimeChart) {
  
      const now = new Date();
  
      const timeString =
      now.getHours() + ":" +
      String(now.getMinutes()).padStart(2,'0') +
      ":" +
      String(now.getSeconds()).padStart(2,'0');
  
      realtimeChart.data.labels.push(
        timeString
      );
  
      realtimeChart.data.datasets[0].data.push(
        turbidity
      );
  
      if (
        realtimeChart.data.labels.length > 10
      ) {
  
        realtimeChart.data.labels.shift();
  
        realtimeChart.data.datasets[0].data.shift();
  
      }
  
      realtimeChart.update();
  
    }
  
  }

  async function fetchMonitorData() {
    try {
      const res = await fetch(API_URLS.monitor, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!res.ok) return;

      const result = await res.json();

      const data = Array.isArray(result.data) ? result.data[0] : result.data;

      if (!data) return;

      // Temperature
      const temp = Number(data.temperature);
      if (!isNaN(temp)) {
        updateDashboard(temp.toFixed(1));
      }

      // Servo
      if (data.servo_status === "ON") {
        // Assuming servo logic handles its own UI or we can update a status text here
        // Implementation for servo status was present in previous script, reusing element:
        if (servoStatusText) {
          servoStatusText.innerText = "Memberi Pakan...";
          servoStatusText.style.color = "var(--primary)";
        }
      } else {
        if (servoStatusText) {
          // Reset if needed, but usually we just leave it unless we want to show "Idle"
          // Previous script had 'visualHoldTimeout' logic which we can simplify or keep if critical.
          // For now, let's keep it simple.
          servoStatusText.innerText = "Standby";
          servoStatusText.style.color = "var(--secondary)";
        }
      }

    } catch (err) {
      console.error("Monitor error:", err);
    }
  }


  // ==========================================
// 7. TURBIDITY LOGIC
// ==========================================

async function fetchTurbidity() {

  try {

    const res =
    await fetch(
      API_URLS.turbidity,
      {
        headers:{
          'ngrok-skip-browser-warning':'true'
        }
      }
    );

    const result =
    await res.json();

    const value =
    Number(
      result.data.turbidity
    );

    console.log("TURBIDITY UPDATE", value);

    updateDashboard(value);

  }
  catch(err){

    console.error(err);

  }

}

async function loadDrainTurbidity() {

  try {

      const res =
      await fetch("/api/turbidity/latest");

      const result =
      await res.json();

      const value =
      result.data.turbidity;

      const el =
      document.getElementById(
          "drainTurbidity"
      );

      if (el) {

          el.innerText = value;

      }

  } catch (err) {

      console.log(
          "Drain Turbidity Error:",
          err
      );

  }

}


  // ==========================================
  // 8. RELAY / SOLENOID LOGIC
  // ==========================================

  async function updateRelayStatus() {
    try {
      const res = await fetch(API_URLS.relayStatus, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return;
      const result = await res.json();

      if (result.status && solenoidStatus) {
        solenoidStatus.textContent = result.status;
        solenoidStatus.style.color = result.status === "ON" ? "green" : "red";
      }
    } catch (err) {
      console.error("Relay error:", err);
    }
  }

  if (btnSolenoidOn) {
    btnSolenoidOn.addEventListener("click", async () => {
      btnSolenoidOn.disabled = true;
      try {
        await fetch(API_URLS.relayOn, { method: "POST" });
        await updateRelayStatus();
      } catch { alert("Gagal ON"); }
      btnSolenoidOn.disabled = false;
    });
  }

  if (btnSolenoidOff) {
    btnSolenoidOff.addEventListener("click", async () => {
      btnSolenoidOff.disabled = true;
      try {
        await fetch(API_URLS.relayOff, { method: "POST" });
        await updateRelayStatus();
      } catch { alert("Gagal OFF"); }
      btnSolenoidOff.disabled = false;
    });
  }


  // ==========================================
  // 9. INIT & LOOPS
  // ==========================================

  

  // Initial fetch
  fetchTurbidity();
  loadWater();
  updateRelayStatus();
  loadDrainTurbidity();
  loadAutoStatus();
  loadSchedulesFromServer();
  // Loops
  setInterval(fetchTurbidity, 3000);
  setInterval(loadWater, 3000);
  setInterval(updateRelayStatus, 5000);
  setInterval(loadDrainTurbidity, 3000);
  setInterval(loadSchedulesFromServer, 3000);

  // ==========================================
  // 10. AUTO FEED & DRAIN (NEW FEATURE)
  // ==========================================

  async function feedNowManual() {
    try {
      await fetch(`${BASE_URL}/api/relay/feed`, {
        method: "POST"
      });
      alert("Pakan diberikan!");
    } catch (err) {
      alert("Gagal memberi pakan");
    }
  }

  async function drainNowManual() {
    try {
      await fetch(`${BASE_URL}/api/relay/drain`, {
        method: "POST"
      });
      alert("Drain dijalankan!");
    } catch (err) {
      alert("Gagal drain");
    }
  }

  const autoDrainToggle = document.getElementById("autoDrainToggle");

  function checkAutoDrain(value) {
    if (!autoDrainToggle?.checked) return;

    if (value > 70) { // threshold keruh
      drainNowManual();
      alert("Air keruh! Drain otomatis dijalankan");
    }
  }

  async function loadWater(){

    try{
    
    const res =
    await fetch(
    "/api/water/latest"
    );
    
    const data=
    await res.json();

    console.log(
      "WATER API:",
      data
      );
    
    const el=
    document.getElementById(
    "waterLevel"
    );
    
    if(el){
    
    el.innerHTML=
    data.waterLevel+
    " cm";
    
    }
    
    }
    catch(e){
    
    console.log(
    "Water Error:",
    e
    );
    
    }
    
    }

});
