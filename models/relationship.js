import Anime from "./AnimeModel.js";
import Episode from "./EpisodeModel.js";
import Schedule from "./Schedule.js";
import WatchAnime from "./WatchAnime.js";
import Users from "./Usermodel.js";

// anime to episode
Anime.hasMany(Episode, {
  foreignKey: "animeID",
  as: "episode",
  onDelete: "CASCADE",
});

Episode.belongsTo(Anime, {
  foreignKey: "animeID",
  as: "animeEpisode",
});

// anime to schedule
Anime.hasOne(Schedule, {
  foreignKey: "animeID",
  as: "schedule",
  onDelete: "CASCADE",
});
Schedule.belongsTo(Anime, {
  foreignKey: "animeID",
  as: "animeSchedule",
});

// anime to Watchanime
Anime.hasOne(WatchAnime, {
  foreignKey: "animeID",
  as: "animeWatch",
  onDelete: "CASCADE",
});
WatchAnime.belongsTo(Anime, {
  foreignKey: "animeID",
  as: "animeWatch",
});
Episode.hasOne(WatchAnime, {
  foreignKey: "episodeID",
  as: "episodeWatch",
  onDelete: "CASCADE",
});
WatchAnime.belongsTo(Episode, {
  foreignKey: "episodeID",
  as: "episodeWatch",
});
Users.hasOne(WatchAnime, {
  foreignKey: "userID",
  as: "userWatch",
  onDelete: "CASCADE",
});
WatchAnime.belongsTo(Users, {
  foreignKey: "userID",
  as: "userWatch",
});

export { Users, Anime, Episode, Schedule, WatchAnime };
