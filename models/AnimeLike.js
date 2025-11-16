import db from "../config/db.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const AnimeLike = db.define(
  "episode_like",
  {
    userID: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "user id not empty",
        },
      },
    },
    episodeID: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "episode id not empty",
        },
      },
    },
    animeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "anime id not empty",
        },
      },
    },
    like: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dislike: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

export default AnimeLike;
