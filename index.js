import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/user.js";
import cookieParser from "cookie-parser";

// initialize server
const app = express();
dotenv.config();

// let whitelist = ["https://taupe-mousse-6ba3b1.netlify.app"];
// let corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };
// parse cookies
app.use(cookieParser());

app.use(cors({
  origin: "*",
  credentials: true
}));

// Set up bodyparser to store the body of a req in req.body
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// post routes
app.use("/posts", postRoutes);
app.use("/user", userRoutes);


// create PORT
const PORT = process.env.PORT;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch((err) => console.log(err.message));
