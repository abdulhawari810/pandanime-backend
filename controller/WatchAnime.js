import { WatchAnime } from "../models/relationship.js";
import { Op } from "sequelize";

export const getWatchAnime = async (req, res) => {
  try {
    const watch = await WatchAnime.findAll();

    if (!watch) {
      return res.status(404).json({ message: "Watch Not Found" });
    }
    res.status(200).json({ message: "Watch Found", watch: watch });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
export const getWatchAnimeByID = async (req, res) => {
  try {
    const { userid } = req.query;
    const watch = await WatchAnime.findOne({
      where: {
        userID: userid,
      },
    });

    if (!watch) {
      return res.status(404).json({ message: "Watch Not Found" });
    }
    res.status(200).json({ message: "Watch Found", watch: watch });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
export const CreateWatchAnime = async (req, res) => {
  try {
    const { userID, animeID, episodeID } = req.body;
    const watch = await WatchAnime.findOne({
      where: { episodeID, userID },
    });

    if (!watch) {
      await WatchAnime.create({
        userID,
        animeID,
        episodeID,
      });
    }
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const CreateAllWatchAnime = async (req, res) => {
  try {
    const data = req.body;

    for (const w of data) {
      const watch = await WatchAnime.findOne({
        where: { episodeID: w.episodeID, userID: w.userID },
      });

      if (!watch) {
        await WatchAnime.create({
          userID: w.userID,
          animeID: w.animeID,
          episodeID: w.episodeID,
        });
      }
    }

    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
