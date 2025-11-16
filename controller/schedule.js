import { where } from "sequelize";
import { Schedule, Anime } from "./../models/relationship.js";

export const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findAll();

    if (schedule.length === 0)
      return res.status(404).json({ error: "jadwal Anime tidak ditemukan!" });

    res.status(200).json({
      message: "Jadwal Anime Ditemukan!!",
      jadwal: schedule,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getScheduleByDay = async (req, res) => {};
export const createSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { hari, jam } = req.body;
    const anime = await Anime.findOne({
      where: {
        id: id,
      },
    });
    const existing = await Schedule.findOne({
      where: {
        animeID: id,
      },
    });

    if (existing) {
      return res
        .status(403)
        .json({ error: "Jadwal untuk anime ber id " + id + " sudah ada!" });
    } else if (anime && anime.status === "Selesai Tayang")
      return res.status(403).json({ error: "Anime ini sudah Selesai Tayang" });

    await Schedule.create({
      hari,
      jam,
      animeID: id,
    });

    res.status(201).json({ message: "Jadwal berhasil ditambahkan!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const createAllSchedule = async (req, res) => {
  try {
    const schedules = req.body; // array

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: "Body harus berupa array!" });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const item of schedules) {
      const { animeID, hari, jam } = item;

      // Cek apakah anime ada
      const anime = await Anime.findByPk(animeID);
      if (!anime) {
        results.failed.push({
          animeID,
          reason: "Anime tidak ditemukan",
        });
        continue;
      }

      // Cek apakah jadwal sudah ada
      const exist = await Schedule.findOne({
        where: { animeID },
      });

      if (exist) {
        results.failed.push({
          animeID,
          reason: "Jadwal sudah ada",
        });
        continue;
      }

      // Cek status anime
      if (anime.status === "Selesai Tayang") {
        results.failed.push({
          animeID,
          reason: "Anime sudah selesai tayang",
        });
        continue;
      }

      // Insert
      await Schedule.create({
        animeID,
        hari,
        jam,
      });

      results.success.push({ animeID });
    }

    res.status(201).json({
      message: "Proses tambah jadwal selesai",
      totalAdded: results.success.length,
      totalFailed: results.failed.length,
      result: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSchedule = async (req, res) => {};
export const deleteSchedule = async (req, res) => {};
