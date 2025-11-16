import db from "../config/db.js";
import { Sequelize } from "sequelize";
import path from "path";

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "UUID tidak boleh kosong!!",
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [5, 100],
          msg: "Minimal 5 Karakter dan maksimal 100 karakter!",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "ini bukan email yang valid!!",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "password tidak boleh kosong!!",
        },
      },
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "default.png",
      validate: {
        isImage(value) {
          const allowedEkstensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
          const ext = path.extname(value).toLowerCase();
          if (!allowedEkstensions.includes(ext)) {
            throw new Error(
              "Hanya ekstensi png, jpg, jpeg, gif, webp yang diperbolehkan!"
            );
          }
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "users",
    },
  },
  {
    freezeTableName: true,
  }
);

export default Users;
