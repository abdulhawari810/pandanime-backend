import db from "../config/db.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;
const WatchAnime = db.define(
  "watch",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    episodeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Episode ID not Empty",
        },
      },
    },
    animeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "anime ID not Empty",
        },
      },
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "User ID not Empty",
        },
      },
    },
  },
  {
    freezeTableName: true,
    modelName: "WatchAnime",
    indexes: [
      {
        unique: true,
        fields: ["userID", "episodeID"],
      },
    ],
  }
);

export default WatchAnime;
