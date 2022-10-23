import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  // destructure user details from request body
  const { username, email, password } = req.body;

  const image = "https://i.ibb.co/mbH7CdH/profilepic2.png";

  try {
    // get existing user from db
    const existingUser = await User.findOne({ email });

    // if there is an user throw a 404 error so the user doesn't create another one
    if (existingUser)
      return res.status(404).json({ message: "User already exists" });

    // hash passwords for security reasons
    const hashedPassword = await bcrypt.hash(password, 12);

    // send hashed password and other user details to db
    const result = await User.create({
      email,
      password: hashedPassword,
      username,
      image,
    });

    // create a json web token that expires in 24h
    // const token = jwt.sign({ email: result?.email, id: result?._id }, "test", {
    //   expiresIn: "24h",
    // });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if user exists in db
    const existingUser = await User.findOne({ email });

    // compare typed password with the existing one in db
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    // if password isn't the right one for this acc throw an error
    if (!isPasswordCorrect)
      return res.status(404).send({ error: "Invalid Password" });

    res.status(200).json({ result: existingUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSuggestions = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await User.find();

    // 1. map through array
    const unfollowedUsers = users
      .map((user) => {
        // 2. find if user exists in the followers list
        const index = user.followers.findIndex((user) => user === id);
        // 3. if users exists then keep user in followers list
        if (index === -1) {
          return user;
        }
      })
      // 4. if user doesn't exist in the list remove it
      .filter((a) => a !== undefined);

    res.status(200).json(unfollowedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const followUser = async (req, res) => {
  const { followingUser, followedUserId } = req.body;

  try {
    // find user in db
    const user = await User.findById(followedUserId);

    // if there is no user found respond with an error
    if (!user) return res.status(404).json({ error: "User not found" });

    // check if user has followed
    const userIsFollowed = user.followers.findIndex(
      (id) => id === followingUser
    );

    // if user hasn't followed it will be equal to -1 and push the follower in user followers array
    if (userIsFollowed === -1) {
      user.followers.push(followingUser);
    } else {
      // if user has followed return those user that haven't followed
      user.followers = user.followers.filter((id) => id !== followingUser);
    }

    // find the user and update it with the new followers
    const updatedFollowers = await User.findByIdAndUpdate(
      followedUserId,
      user,
      {
        new: true,
      }
    );

    // send back the updated followers to properly update the state in UI
    res.status(200).json(updatedFollowers);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  const username = new RegExp(id, "i");

  try {
    const user = await User.find({ username });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const editUserDescription = async (req, res) => {
  const { description } = req.body;
  const { id } = req.params;

  const username = new RegExp(id, "i");

  try {
    // find user and update its description with the new description
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { description: description },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// edit user Image
export const editUserImage = async (req, res) => {
  const { image, id } = req.body;

  const username = new RegExp(id, "i");

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { image: image },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
