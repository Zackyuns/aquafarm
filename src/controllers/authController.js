const User = require('../models/userModel');

exports.addSchedule = (req, res) => {
  if (req.body.role !== "owner") {
    return res.status(403).json({ message: "Hanya pemilik" });
  }

  // insert ke DB
};

exports.feedNow = (req, res) => {
  const role = req.body.role;

  if (role !== "owner") {
    return res.status(403).json({
      message: "Akses ditolak"
    });
  }

  // lanjut jalankan feeder
};

exports.login = async (req, res) => {
  console.log("LOGIN MASUK");

  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      console.log("User tidak ditemukan");
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    if (user.password !== password) {
      console.log("Password salah");
      return res.status(401).json({ message: "Password salah" });
    }

    console.log("Login berhasil");

    return res.json({
      message: "Login berhasil",
      role: user.role
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};