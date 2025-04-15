import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";
import multer from "multer";
import cors from "cors";
import { PostController, UserController } from "./controllers/index.js";
import { handleValidationErrors, checkAuth } from "./utils/index.js";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB OK"))
  .catch((err) => console.log("DB error", err));

const app = express();

app.use(
  cors({
    origin: "https://front-plum-six.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Добавляем PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')){
      fs.mkdirSync('uploads')
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  console.log("Upload request headers:", req.headers);
  console.log("Uploaded file:", req.file);
  if (req.file) {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    });
  } else {
    console.error("No file uploaded");
    res.status(400).json({ message: "Ошибка при загрузке файла" });
  }
});

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

app.get("/auth/me", checkAuth, UserController.getMe);

app.get("/tags", PostController.getLastTags);

app.get("/posts/tags", PostController.getLastTags);
app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("server ok");
});
