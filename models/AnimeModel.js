import db from "../config/db.js";
import { Sequelize } from "sequelize";
import slugify from "slugify";

const { DataTypes } = Sequelize;

const Anime = db.define(
  "anime",
  {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Judul atau Slug tidak boleh kosong!",
        },
      },
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Judul tidak boleh kosong!",
        },
      },
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: {
          args: true,
          msg: "Ini bukan URL yang valid!",
        },
      },
    },
    musim: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    studio: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    negara: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    adaptasi: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    kualitas: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    durasi: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    rating: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    tipe: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    demografis: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    eksplisit: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    kredit: {
      type: DataTypes.STRING,
      defaultValue: "??",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "on-going",
    },
    total_eps: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    skor: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    peminat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    genre: {
      type: DataTypes.TEXT,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

Anime.beforeCreate((anime) => {
  if (!anime.slug) {
    anime.slug = slugify(anime.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
});

Anime.beforeUpdate((anime) => {
  if (anime.changed("title")) {
    anime.slug = slugify(anime.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
});

Anime.beforeCreate((anime) => {
  if (anime.deskripsi) {
    anime.deskripsi = anime.deskripsi
      .split(/\r?\n+/) // pisahkan tiap baris kosong atau newline
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  }
});

Anime.beforeUpdate((anime) => {
  if (anime.changed("deskripsi") && anime.deskripsi) {
    anime.deskripsi = anime.deskripsi
      .split(/\r?\n+/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  }
});

export default Anime;
