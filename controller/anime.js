import { Anime, Episode, Schedule } from "../models/relationship.js";
import slugify from "slugify";
import { Op, Sequelize, where } from "sequelize";
import SqlString from "sqlstring";

export const AnimeCarousel = async (req, res) => {
  try {
    const anime = await Anime.findAll({ limit: 10 });

    if (anime.length == 0) {
      return res.status(404).json({
        error: "Anime tidak ditemukan!",
      });
    }

    res.status(200).json({
      message: "Anime ditemukan!",
      anime: anime,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getAllAnime = async (req, res) => {
  const { filter, genre, hari, alphabet } = req.query;

  const safeGenre = SqlString.escape(genre)
    .replace(/'/g, "")
    .trim()
    .toLowerCase();
  const safeHari = SqlString.escape(hari)
    .replace(/'/g, "")
    .trim()
    .toLowerCase();
  const safeAlpha = SqlString.escape(alphabet)
    .replace(/'/g, "")
    .trim()
    .toLowerCase();

  const genreCondition = {};
  const JadwalCondition = [];

  if (safeGenre && safeGenre !== "semua") {
    genreCondition.genre = {
      [Op.regexp]: safeGenre,
    };
  }

  if (safeAlpha && safeAlpha !== "all") {
    genreCondition.judul = {
      [Op.like]: `${safeAlpha}%`,
    };
  }

  if (safeHari && safeHari !== "semua") {
    JadwalCondition.push({
      model: Schedule,
      as: "schedule",
      where: {
        hari: safeHari,
      },
      required: true,
    });
  } else {
    JadwalCondition.push({
      model: Schedule,
      as: "schedule",
      required: false,
    });
  }

  // Mapping filter ke order SQL
  const orderMap = {
    Semua: ["id", "DESC"],
    Populer: ["peminat", "DESC"],
    "Update Terbaru": ["updatedAt", "DESC"],
    "Rilis Terbaru": ["createdAt", "DESC"],
  };

  // Jika filter tidak ada di mapping → fallback ke ID DESC
  const order = [orderMap[filter] || ["id", "DESC"]];

  try {
    const anime = await Anime.findAll({
      where: genreCondition,
      order,
      include: JadwalCondition,
    });

    res.status(200).json({
      message: "Anime ditemukan!",
      anime: anime,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getSearchAnime = async (req, res) => {
  try {
    const { query } = req.params;

    // kalau query kosong, kembalikan error ringan
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ error: "Query pencarian tidak boleh kosong!" });
    }

    const anime = await Anime.findAll({
      where: {
        [Op.or]: [
          { judul: { [Op.like]: `%${query}%` } },
          { deskripsi: { [Op.like]: `%${query}%` } },
        ],
      },
    });

    if (anime.length === 0) {
      return res.status(404).json({
        message: "Anime tidak ditemukan!",
        anime: [],
      });
    }

    res.status(200).json({
      message: "Anime ditemukan!",
      anime,
    });
  } catch (error) {
    console.error("Error search:", error);
    res.status(500).json({ error: "Terjadi kesalahan server!" });
  }
};
export const getAnimeById = async (req, res) => {
  try {
    const { slug } = req.params;
    const anime = await Anime.findOne({
      where: {
        [Op.or]: [{ slug: slug }, { id: slug }],
      },
    });
    const episode = await Episode.findAll({
      where: {
        animeID: anime.id,
      },
    });

    if (!anime)
      return res.status(404).json({ error: "Anime tidak ditemukan!" });

    res.status(200).json({
      message: "Anime berhasil ditemukan!",
      anime: anime,
      episode: episode,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const CreateAnime = async (req, res) => {
  try {
    const { formData, genre, deskripsi } = req.body;

    const slug = slugify(formData["judul"], {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    await Anime.create({
      slug: slug,
      judul: formData["judul"],
      genre: JSON.stringify(genre),
      total_eps: formData["total_eps"],
      kualitas: formData["kualitas"],
      status: formData["status"],
      adaptasi: formData["adaptasi"],
      negara: formData["negara"],
      studio: formData["studio"],
      tipe: formData["tipe"],
      musim: formData["musim"],
      eksplisit: formData["eksplisit"] || null,
      demografis: formData["demografis"] || null,
      rating: formData["rating"],
      deskripsi: deskripsi,
      skor: formData["skor"],
      peminat: formData["peminat"],
      kredit: formData["kredit"],
      thumbnail: formData["thumbnail"],
      durasi: formData["durasi"],
    });

    res.status(201).json({
      message: "Anime sukses ditambahkan!!",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const UpdateAnime = async (req, res) => {
  try {
    const {
      judul,
      genre,
      total_eps,
      kualitas,
      status,
      adaptasi,
      negara,
      studio,
      tipe,
      musim,
      eksplisit,
      demografis,
      rating,
      deskripsi,
      skor,
      peminat,
      kredit,
      thumbnail,
      durasi,
    } = req.body;

    const { id } = req.params;
    const slug = slugify(judul, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    await Anime.update(
      {
        slug: slug,
        judul: judul,
        genre: JSON.stringify(genre),
        total_eps: total_eps,
        kualitas: kualitas,
        status: status,
        adaptasi: adaptasi,
        negara: negara,
        studio: studio,
        tipe: tipe,
        musim: musim,
        eksplisit: eksplisit,
        demografis: demografis,
        rating: rating,
        deskripsi: deskripsi,
        skor: skor,
        peminat: peminat,
        kredit: kredit,
        thumbnail: thumbnail,
        durasi: durasi,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.status(201).json({
      message: "Anime sukses diupdate!!",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const DeleteAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const anime = await Anime.findOne({
      where: {
        id: id,
      },
    });

    if (!anime)
      return res.status(404).json({ error: "Anime tidak ditemukan!!" });

    await Anime.destroy({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      message: "Anime berhasil dihapus!!",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
