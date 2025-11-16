import { Op } from "sequelize";
import Users from "../models/Usermodel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

/* ============================================
   GET ALL USERS (Tidak perlu token)
   ============================================ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ["password"] },
    });

    if (users.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan!" });
    }

    res.status(200).json({
      message: "Data berhasil ditemukan!",
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================================
   GET USER BY ID (Token dari middleware)
   ============================================ */
export const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;

    // Data user hasil dari middleware verifyToken
    const decoded = req.user;

    // Batasi akses: user biasa hanya bisa lihat data miliknya sendiri
    if (decoded.role !== "admin" && decoded.id != id) {
      return res.status(403).json({ error: "Akses ditolak!" });
    }

    const users = await Users.findOne({
      where: { id },
    });

    if (!users) {
      return res.status(404).json({ error: "Users tidak ditemukan!" });
    }

    res.status(200).json({
      message: "Users ditemukan!",
      users,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ============================================
   UPDATE USERS (Token dari middleware)
   ============================================ */
export const UpdateUsers = async (req, res) => {
  try {
    const decoded = req.user; // dari middleware auth JWT
    const { username, email, password } = req.body;

    // Ambil data user saat ini
    const users = await Users.findOne({ where: { id: decoded.id } });
    if (!users) {
      return res.status(404).json({ error: "Users tidak ditemukan!" });
    }

    // Hash password baru kalau diubah, kalau tidak pakai yang lama
    const hash = password ? await argon2.hash(password) : users.password;

    // === HANDLE GAMBAR PROFIL ===
    let newProfile = users.profile;

    if (req.file) {
      const oldPath = path.join("uploads", users.profile || "");
      // Hapus gambar lama kalau ada dan file-nya eksis
      if (users.profile && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      newProfile = req.file.filename; // Nama file baru dari multer
    }

    // Update ke database
    await Users.update(
      {
        username: username || users.username,
        email: email || users.email,
        password: hash,
        profile: newProfile,
      },
      { where: { id: decoded.id } }
    );

    res.status(200).json({ message: "Profil berhasil diubah!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

/* ============================================
   DELETE USERS (Token dari middleware)
   ============================================ */
export const DeleteUsers = async (req, res) => {
  try {
    const decoded = req.user;

    const users = await Users.findOne({ where: { id: decoded.id } });
    if (!users)
      return res.status(404).json({ error: "Users tidak ditemukan!" });

    await Users.destroy({ where: { id: decoded.id } });
    res.status(200).json({ message: "Users berhasil dihapus!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ============================================
   REGISTER
   ============================================ */
export const Register = async (req, res) => {
  try {
    const { username, email, password, confPass } = req.body;

    const existingUser = await Users.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    const allUsers = await Users.findAll();
    const errors = [];

    if (existingUser) errors.push("Username atau email sudah digunakan!");
    if (password !== confPass)
      errors.push("Password dan konfirmasi tidak sama!");

    const role = allUsers.length > 0 ? "users" : "admin";
    if (errors.length > 0) return res.status(400).json({ error: errors });

    const hash = await argon2.hash(password);
    await Users.create({ username, email, password: hash, role });

    res.status(201).json({ message: "Berhasil register!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ============================================
   LOGIN
   ============================================ */
export const Login = async (req, res) => {
  try {
    const { userOREmail, password } = req.body;

    const user = await Users.findOne({
      where: {
        [Op.or]: [{ username: userOREmail }, { email: userOREmail }],
      },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const match = await argon2.verify(user.password, password);
    if (!match) return res.status(400).json({ error: "Password salah" });

    // 🔑 Token hanya berisi id
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: "auto",
      sameSite: "none",
      maxAge: 168 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ============================================
   ME (Optional — pakai header Authorization)
   ============================================ */
export const Me = async (req, res) => {
  try {
    const user = req.user; // sudah diisi oleh verifyToken
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const Logout = async (req, res) => {
  try {
    // Hapus cookie token dari browser
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // ubah ke true kalau sudah pakai HTTPS
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logout berhasil!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal logout", error: error.message });
  }
};
