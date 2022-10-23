import Categories from "../models/categories.js";
import Post from "../models/post.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const getPopularPosts = async (req, res) => {
  try {
    const posts = await Post.find().limit(2);

    const sortedPosts = posts
      .sort((a, b) => a.likes.length - b.likes.length)
      .reverse();

    res.status(200).json(sortedPosts);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const createPost = async (req, res) => {
  const body = req.body;

  try {
    const createdPost = await Post.create(body);

    res.status(200).json(createdPost);
  } catch (error) {
    res.status(409).json({ error: error });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Categories.find();

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const createComment = async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    post.comments.push(body);

    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const likePost = async (req, res) => {
  const { username, id } = req.body;

  try {
    const post = await Post.findById(id);

    const userHasLiked = post.likes.findIndex((user) => user === username);

    if (userHasLiked === -1) {
      post.likes.push(username);
    } else {
      post.likes = post.likes.filter((id) => id !== username);
    }

    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const editPost = async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  try {
    const post = await Post.findByIdAndUpdate(id, body, { new: true });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    await Post.findByIdAndRemove(id);

    res.status(200).json({ message: "Post deleted successfuly" });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getPostsBySearch = async (req, res) => {
  const { id } = req.params;

  const title = new RegExp(id, "i");

  try {
    const posts = await Post.find({ title });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const getPostsByCategory = async (req, res) => {
  const { id } = req.params;

  const category = new RegExp(id, "i");

  try {
    const posts = await Post.find({ category });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const getUserPosts = async (req, res) => {
  const { id } = req.params;

  const username = new RegExp(id, "i");

  try {
    const posts = await Post.find({ username });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
