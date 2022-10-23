import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  id: { type: String },
  category: { type: String },
  image: { type: String },
});

export default mongoose.model("Category", categorySchema);
