import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String },
  date: { type: Date },
  likes: { type: [String], default: [] },
  category: { type: String },
  comments: [
    {
      type: Array,
      default: [],
    },
  ],
});

export default mongoose.model("Post", postSchema);
