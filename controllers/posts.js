import Categories from "../models/categories.js";
import Post from "../models/post.js";
import jwtDecode from "jwt-decode";

export const getPosts = async (req, res) => {
  try {
    // find all posts and sort them by date
    const posts = await Post.find().sort({ date: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404);
  }
};

export const getPopularPosts = async (req, res) => {
  try {
    // find 2 posts
    const posts = await Post.find().limit(2);

    // sort them by the number of likes
    const sortedPosts = posts
      .sort((a, b) => a.likes.length - b.likes.length)
      .reverse();

    res.status(200).json(sortedPosts);
  } catch (error) {
    res.status(404);
  }
};

export const createPost = async (req, res) => {
  const { category, image, message, title, date } = req.body;
  // get user token from cookie
  const token = req.headers.cookie?.split("=")[1];

  if (!token) return res.status(404).json("You aren't authorized to do this");

  try {
    const { id, username } = jwtDecode(token);

    // create the post based on user token information and the body sent via api
    const post = { category, image, message, title, date, id, username };

    // create the post
    const createdPost = await Post.create(post);

    res.status(200).json(createdPost);
  } catch (error) {
    res.status(409);
  }
};

export const getCategories = async (req, res) => {
  try {
    // find all categories
    const categories = await Categories.find();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500);
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    // find a specific post to show the post details and comment on it
    const post = await Post.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(500);
  }
};

export const createComment = async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  try {
    // find a specific post
    const post = await Post.findById(id);

    // update the post with the new comment
    post.comments.push(body);

    // update the post in db with the new comment added by user
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500);
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.cookie?.split("=")[1];

  if (!token) return res.status(204);

  try {
    const { username } = jwtDecode(token);

    // find a specific post
    const post = await Post.findById(id);

    // check if the user has liked
    const userHasLiked = post.likes.findIndex((user) => user === username);

    // if user hasn't liked add the username in the likes array
    if (userHasLiked === -1) {
      post.likes.push(username);
    } else {
      //  if the user has liked then remove the username from likes array
      post.likes = post.likes.filter((id) => id !== username);
    }

    // update the post in the db with the new likes array
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500);
  }
};

export const editPost = async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  try {
    // find a specific post and edit it with the new information added
    const post = await Post.findByIdAndUpdate(id, body, { new: true });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    // find and delete a specific post
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
    // find posts by title
    const posts = await Post.find({ title });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404);
  }
};

export const getPostsByCategory = async (req, res) => {
  const { id: category } = req.params;

  try {
    // find posts by category
    const posts = await Post.find({ category });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404);
  }
};

export const getUserPosts = async (req, res) => {
  const { id: username } = req.params;

  try {
    // find posts by username to display the posts belonging to the user profile page
    const posts = await Post.find({ username });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500);
  }
};
