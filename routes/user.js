import express from "express";
import {
  editUserDescription,
  editUserImage,
  followUser,
  getSuggestions,
  getUser,
  getUserProfile,
  signin,
  signinWithGoogle,
  signout,
  signup,
} from "../controllers/user.js";

const router = express.Router();

router.get("/", getUser);
router.get("/:id/profile", getUserProfile);
router.get("/:id", getSuggestions);
router.post("/signup", signup);
router.post("/signinWithGoogle", signinWithGoogle);
router.post("/signin", signin);
router.post("/signout", signout);
router.patch("/follow", followUser);
router.patch("/:id/editDescription", editUserDescription);
router.patch("/editImage", editUserImage);

export default router;
