const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const turbidityRoutes = require('./src/routes/turbidityRoutes');
const relayRoutes = require('./src/routes/relayRoutes');
const getSchedule = require('./src/routes/scheduleget')
const app = express();
const authRoutes = require('./src/routes/authRoutes');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const scheduleRoutes = require('./src/routes/scheduleget');
const waterRoutes = require("./src/routes/waterRoutes");
app.use("/api/water", waterRoutes);
app.use('/api/schedule', scheduleRoutes);
require('dotenv').config();
const autoRoutes =require("./src/routes/autoRoutes");
app.use("/api/auto",autoRoutes);
const path = require('path');
const dataRoutes = require('./src/routes/dataRoute');
const manualRelayRoutes = require("./src/routes/manualRelayRoutes");
app.use("/api/manual-relay", manualRelayRoutes);
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors()); // Penting agar frontend bisa akses
app.use(bodyParser.json()); // Agar bisa baca JSON dari ESP
app.use(bodyParser.urlencoded({ extended: true })); // Agar bisa baca Form urlencoded (opsional)

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/feeder', dataRoutes);
app.use('/api/turbidity', turbidityRoutes);
app.use('/api/relay', relayRoutes);
app.use('/api/scheduleget', getSchedule);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan Server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

module.exports = app;