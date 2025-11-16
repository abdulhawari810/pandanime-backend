import db from "../config/db.js";
import { Sequelize } from "sequelize";
import Anime from "./AnimeModel.js";

const { DataTypes } = Sequelize;

const Episode = db.define(
  "episode",
  {
    title: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Judul tidak boleh kosong!!",
        },
      },
    },
    episodeNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    videoURL: {
      type: DataTypes.TEXT,
    },
    sampul: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Episode;
