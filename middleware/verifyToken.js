import jwt from "jsonwebtoken";
import Users from "../models/Usermodel.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1] || null;

    if (!token) {
      return res.status(401).json({ error: "Token tidak ditemukan!" });
    }

    // 🔐 Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Ambil user terkini dari database (bukan dari token)
    const user = await Users.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "profile", "role"],
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan!" });
    }

    // simpan user di request untuk route berikutnya
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid!" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Akses ditolak, hanya admin yang boleh akses halaman ini!!",
    });
  }

  next();
};
