const User = require('../models/userModel');
const bcrypt = require('bcrypt');

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
      return res.status(401).json({
        message: "Email tidak ditemukan"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Password salah"
      });
    }

    return res.json({
      message: "Login berhasil",
      role: user.role
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};