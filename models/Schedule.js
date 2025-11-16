import db from "./../config/db.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Schedule = db.define(
  "jadwal_anime",
  {
    animeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Anime id tidak boleh kosong!",
        },
      },
    },
    hari: {
      type: DataTypes.STRING,
      allowNull: false,
      validat: {
        notEmpty: {
          args: true,
          msg: "Hari tidak boleh kosong!",
        },
      },
    },
    jam: {
      type: DataTypes.STRING,
      allowNull: false,
      validat: {
        notEmpty: {
          args: true,
          msg: "Hari tidak boleh kosong!",
        },
      },
    },
  },
  {
    freezeTableName: true,
  }
);

export default Schedule;
