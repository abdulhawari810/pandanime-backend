import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import db from "./config/db.js";
import router from "./router/routes.js";
import session from "cookie-session";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

console.log("MYSQL CONFIG:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  name: process.env.DB_NAME,
});

const app = express();

// (async () => {
//   db.sync();
// })();
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: "auto",
    },
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  "/storage/thumbnail",
  express.static(path.join(process.cwd(), "storage/thumbnail"))
);
app.use(router);

app.listen(process.env.APP_PORT, () => console.log("Server up and running!!"));
