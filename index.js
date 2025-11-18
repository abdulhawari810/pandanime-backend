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

const allowedOrigins = [
  "https://pandanime-frontend.vercel.app",
  "http://localhost:5173"
];



const app = express();

// (async () => {
//   db.sync();
// })();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());


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
