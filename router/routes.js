import express from "express";
import multer from "multer";
import path from "path";

import {
  getAllUsers,
  getUsersById,
  UpdateUsers,
  DeleteUsers,
  Login,
  Register,
  Me,
  Logout,
} from "../controller/user.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";
import {
  getAllAnime,
  getAnimeById,
  CreateAnime,
  UpdateAnime,
  DeleteAnime,
  getSearchAnime,
  AnimeCarousel,
} from "../controller/anime.js";
import {
  CreateAllEpisode,
  CreateEpisode,
  DeleteAllEpisode,
  DeleteEpisode,
  getEpisodeById,
  UpdateEpisode,
} from "../controller/episode.js";
import {
  deleteSchedule,
  getSchedule,
  createSchedule,
  getScheduleByDay,
  updateSchedule,
  createAllSchedule,
} from "../controller/schedule.js";

import {
  getWatchAnime,
  CreateWatchAnime,
  CreateAllWatchAnime,
} from "./../controller/WatchAnime.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Tipe tidak valid"), false);
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// for users
router.post("/login", Login);
router.post("/register", Register);

// GET
router.get("/anime", getAllAnime);
router.get("/anime/carousel", AnimeCarousel);
router.get("/anime/:slug", getAnimeById);
router.get("/anime/search/:query", getSearchAnime);
router.get("/Me", verifyToken, Me);
router.get("/watch", verifyToken, getWatchAnime);
router.get("/episode/:slug/:id", getEpisodeById);

// POST
router.post("/logout", verifyToken, Logout);
router.post("/watch", verifyToken, CreateWatchAnime);
router.post("/watchAll", verifyToken, CreateAllWatchAnime);

// for admin
// users controller
// GET
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/users/:id", verifyToken, getUsersById);
// PATCH
router.patch("/users/:id", verifyToken, upload.single("profile"), UpdateUsers);
// DELETE
router.delete("/users/:id", verifyToken, verifyAdmin, DeleteUsers);

// anime controller
// POST
router.post("/anime", verifyToken, verifyAdmin, CreateAnime);
// PATCH
router.patch("/anime/:id", verifyToken, verifyAdmin, UpdateAnime);
// DELETE
router.delete("/anime/:id", verifyToken, verifyAdmin, DeleteAnime);

// episode controller
// POST
router.post("/episode/:id", verifyToken, verifyAdmin, CreateEpisode);
router.post("/episodeBatch/:id", verifyToken, verifyAdmin, CreateAllEpisode);
// PATCH
router.patch("/episode/:id", verifyToken, verifyAdmin, UpdateEpisode);
// DELETE
router.delete("/episode/:id", verifyToken, verifyAdmin, DeleteEpisode);
router.delete("/episodeAll/:id", verifyToken, verifyAdmin, DeleteAllEpisode);

// schedule controller
// GET
router.get("/schedule", verifyToken, verifyAdmin, getSchedule);
router.get("/schedule/:id", verifyToken, verifyAdmin, getScheduleByDay);
// POST
router.post("/schedule/:id", verifyToken, verifyAdmin, createSchedule);
router.post("/scheduleAll", verifyToken, verifyAdmin, createAllSchedule);
// PATCH
router.patch("/schedule/:id", verifyToken, verifyAdmin, updateSchedule);
// DELETE
router.delete("/schedule/:id", verifyToken, verifyAdmin, deleteSchedule);
export default router;
