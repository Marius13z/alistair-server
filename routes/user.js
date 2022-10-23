import express from "express";
import {
  editUserDescription,
  editUserImage,
  followUser,
  getSuggestions,
  getUser,
  signin,
  signup,
} from "../controllers/user.js";

const router = express.Router();

router.get("/:id", getSuggestions);
router.get("/:id/profile", getUser);
router.post("/signup", signup);
router.post("/signin", signin);
router.patch("/follow", followUser);
router.patch("/:id/editDescription", editUserDescription);
router.patch("/editImage", editUserImage);

export default router;
