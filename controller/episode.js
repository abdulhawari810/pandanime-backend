import { Anime, Episode, WatchAnime } from "../models/relationship.js";
import { Op } from "sequelize";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import Sequelize from "sequelize";
/**
 * Fungsi untuk menghapus folder secara rekursif (folder dan isinya).
 * @param {string} folderPath - Path lengkap ke folder yang akan dihapus.
 */
function deleteFolder(folderPath, res) {
  // Menggunakan fs.rm() (tersedia dari Node.js 14.4.0, lebih stabil dan direkomendasikan)
  // dengan opsi 'recursive: true' untuk menghapus folder beserta isinya.
  fs.rm(folderPath, { recursive: true, force: true }, (err) => {
    if (err) {
      // Periksa jika error karena folder tidak ditemukan
      if (err.code === "ENOENT") {
        console.error(`Folder tidak ditemukan: ${folderPath}`);
        return res.status(404).send({
          message: `Gagal menghapus folder. Folder tidak ditemukan.`,
          error: err.message,
        });
      }

      // Error lain (izin, dll.)
      console.error(`Gagal menghapus folder ${folderPath}:`, err);
      return res.status(500).send({
        message: "Gagal menghapus folder di server.",
        error: err.message,
      });
    }

    // Sukses
    console.log(`Folder berhasil dihapus: ${folderPath}`);
  });
}

export const getEpisodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug } = req.params;
    const existing = await Episode.findAll({
      where: {
        animeID: id,
      },
    });
    const episode = await Episode.findOne({
      where: {
        animeID: slug,
        episodeNumber: id,
      },
    });
    const watchCount = await WatchAnime.count({
      where: { animeID: slug, episodeID: episode.id },
    });

    // console.log(watchCount);
    const epsAll = await Episode.findAll({
      where: {
        animeID: slug,
      },
    });

    if (!existing)
      return res.status(404).json({ error: "Anime tidak ditemukan!" });

    if (!episode)
      return res.status(404).json({ error: "Anime tidak ditemukan!" });

    res.status(200).json({
      message: "Episode ditemukan",
      episode: episode,
      AllEpisode: epsAll,
      watchCount: watchCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const CreateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoURL, episodeNumber } = req.body;
    const existing = await Episode.findOne({
      where: {
        [Op.and]: [{ animeID: id }, { episodeNumber }],
      },
    });
    const anime = await Anime.findOne({
      where: {
        id: id,
      },
    });

    const test = JSON.stringify(videoURL);
    const p = JSON.parse(test);
    const fet = p["720p"];
    const slug = anime.slug;

    if (existing) {
      return res.status(400).json({ error: "Episode sudah ada" });
    }

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    const thumbnailDIR = path.join(
      process.cwd(),
      `storage/thumbnail/${slug.substring(0, 11)}`
    );
    if (!fs.existsSync(thumbnailDIR)) fs.mkdirSync(thumbnailDIR);

    const filename = `${slug.substring(0, 11)}-episode-${
      episodeNumber || "unknown"
    }.jpg`;
    const outputPath = path.join(thumbnailDIR, filename);

    ffmpeg(fet)
      .on("end", async () => {
        console.log(`thumbnail untuk ${filename} berhasil dibuat`);
        await Episode.create({
          title,
          videoURL: JSON.stringify(videoURL),
          episodeNumber,
          animeID: id,
          sampul: filename,
        });

        res.sendFile(outputPath);
        res.status(201).json({
          message: "Episode berhasil ditambahkan",
        });
      })
      .on("error", (err) => {
        console.log(`Gagal mengambil thumbnail ${filename}`, err.message);
        res.status(500).json({ error: "Gagal mengambil thumbnail" });
      })
      .screenshots({
        count: 2,
        timemarks: [5],
        filename: filename,
        folder: thumbnailDIR,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// export const CreateAllEpisode = async (req, res) => {
//   try {
//     const { id } = req.params; // ID anime
//     const data = req.body; // array of episode objects

//     if (!Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ error: "Data episode kosong!" });
//     }

//     // Simpan hasil episode yang sukses dan gagal
//     const result = {
//       success: [],
//       failed: [],
//     };

//     ffmpeg.setFfmpegPath(ffmpegInstaller.path);

//     const generateThumbnail = (fet, filename, thumbnailDIR) => {
//       return new Promise((resolve, reject) => {
//         ffmpeg(fet)
//           .on("end", () => resolve())
//           .on("error", (err) => reject(err))
//           .screenshots({
//             count: 1,
//             timemarks: ["5"],
//             filename: filename,
//             folder: thumbnailDIR,
//           });
//       });
//     };

//     const thumbnailDIR = path.join(process.cwd(), "storage/thumbnail");
//     if (!fs.existsSync(thumbnailDIR)) fs.mkdirSync(thumbnailDIR);

//     // Loop semua episode dari payload
//     for (const ep of data) {
//       const episodeNumber = ep.episodeNumber || ep.episode;
//       const title = ep.title;
//       const videoURL = JSON.stringify(ep.videoURL || ep.sources);

//       // Cek apakah sudah ada episode dengan animeID dan episodeNumber ini
//       const existing = await Episode.findOne({
//         where: {
//           [Op.and]: [{ animeID: id }, { episodeNumber }],
//         },
//       });

//       const p = ep.videoURL || ep.sources;
//       const fet = p["720p"];

//       if (existing) {
//         result.failed.push({
//           episodeNumber,
//           reason: "Episode sudah ada",
//         });
//         continue; // skip yang sudah ada
//       }

//       const filename = `${ep.slug}-episode-${episodeNumber || "unknown"}.jpg`;
//       const outputPath = path.join(thumbnailDIR, filename);
//       await generateThumbnail(fet, filename, thumbnailDIR);
//       await Episode.create({
//         title,
//         videoURL: videoURL,
//         episodeNumber,
//         animeID: id,
//         sampul: filename,
//       });
//       result.success.push(episodeNumber);
//     }
//     res.sendFile(outputPath);
//     return res.status(201).json({
//       message: "Proses tambah episode selesai",
//       totalAdded: result.success.length,
//       totalSkipped: result.failed.length,
//       result,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

export const CreateAllEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const anime = await Anime.findOne({
      where: {
        id: id,
      },
    });
    const slug = anime.slug;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Data episode kosong!" });
    }

    const result = { success: [], failed: [] };

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    const thumbnailDIR = path.join(
      process.cwd(),
      `storage/thumbnail/${slug.substring(0, 11)}`
    );
    if (!fs.existsSync(thumbnailDIR))
      fs.mkdirSync(thumbnailDIR, { recursive: true });

    // helper promise
    const randomSecond = Math.floor(Math.random() * 20) + 1;
    const randomTimemark = String(randomSecond);
    const generateThumbnail = (fet, filename, folder) => {
      return new Promise((resolve, reject) => {
        ffmpeg(fet)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .screenshots({
            count: 1,
            timemarks: [randomTimemark],
            filename: filename,
            folder: folder,
          });
      });
    };

    for (const ep of data) {
      const episodeNumber = ep.episodeNumber || ep.episode;
      const title = ep.title;
      const sources =
        typeof ep.videoURL === "string" ? JSON.parse(ep.videoURL) : ep.videoURL;
      const fet = sources["720p"];

      const existing = await Episode.findOne({
        where: { [Op.and]: [{ animeID: id }, { episodeNumber }] },
      });

      if (existing) {
        result.failed.push({ episodeNumber, reason: "Episode sudah ada" });
        continue;
      }

      const filename = `${slug.substring(0, 11)}-episode-${episodeNumber}.jpg`;
      const outputPath = path.join(thumbnailDIR, filename);

      try {
        await generateThumbnail(fet, filename, thumbnailDIR);

        await Episode.create({
          title,
          videoURL: JSON.stringify(sources),
          episodeNumber,
          animeID: id,
          sampul: filename,
        });

        result.success.push(episodeNumber);
      } catch (err) {
        console.log(`Gagal generate thumbnail ${filename}`, err.message);
        result.failed.push({ episodeNumber, reason: err.message });
      }
    }

    return res.status(201).json({
      message: "Proses tambah episode selesai",
      totalAdded: result.success.length,
      totalSkipped: result.failed.length,
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateEpisode = async (req, res) => {};
export const DeleteEpisode = async (req, res) => {};
export const DeleteAllEpisode = async (req, res) => {
  const { id } = req.params;
  try {
    const anime = await Anime.findOne({
      where: {
        id: id,
      },
    });
    const slug = anime.slug.substring(0, 11);
    const existing = await Episode.findOne({
      where: {
        animeID: id,
      },
    });
    const folderToDelete = path.join(process.cwd(), "storage/thumbnail", slug);

    if (!existing)
      return res.status(404).json({
        message: "Anime tidak ditemukan!",
      });

    await Episode.destroy({
      where: {
        animeID: id,
      },
    });
    deleteFolder(folderToDelete);
    res.status(200).json({ message: "Episode Anime Berhasil Dihapus!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
