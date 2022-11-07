import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import jwtDecode from "jwt-decode";

export const signup = async (req, res) => {
  // destructure user details from request body
  const { username, email, password } = req.body;

  // default image
  const image = "https://i.ibb.co/mbH7CdH/profilepic2.png";

  try {
    // get existing user from db
    const existingEmail = await User.findOne({ email });

    // if there is an user throw a 404 error so the user doesn't create another one
    if (existingEmail) return res.status(404).json("Email is already used");

    // find user by username in db
    const existingUsername = await User.findOne({ username });

    // if there's a user with this username throw an error
    if (existingUsername)
      return res.status(404).json("Username is already used");

    // hash passwords for security reasons
    const hashedPassword = await bcrypt.hash(password, 12);

    // send hashed password and other user details to db
    const result = await User.create({
      email,
      password: hashedPassword,
      username,
      image,
    });

    // convert newly created user id to string
    const id = result?._id.toString();

    // create a token
    const accessToken = jwt.sign(
      { id, username: result?.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // store token in a cookie
    res.cookie("token", accessToken, {
      httpOnly: false,
      path: "/",
      sameSite: "None",
      secure: true,
      maxAge: 3600000,
    });

    res.status(200).json(accessToken);
  } catch (error) {
    res.status(500);
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
    if (!isPasswordCorrect) return res.status(404).json("Invalid Password");

    // create a jwt token
    const accessToken = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // store token in cookie
    res.cookie("token", accessToken, {
      httpOnly: false,
      path: "/",
      sameSite: "None",
      secure: true,
      maxAge: 3600000,
    });

    res.status(200).json(accessToken);
  } catch (error) {
    res.status(500);
  }
};

export const signinWithGoogle = async (req, res) => {
  const { name: username, picture: image, email } = req.body;

  try {
    // check if there is an user with this username
    const user = await User.findOne({ username });

    // if there's no user with that username create a user
    if (!user) await User.create({ username, image, email });

    // create an access token
    const accessToken = jwt.sign(
      { username: username, id: user?._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // store token in cookie
    res.cookie("token", accessToken, {
      httpOnly: false,
      path: "/",
      sameSite: "None",
      secure: true,
      maxAge: 3600000,
    });

    res.status(200).json(accessToken);
  } catch (error) {
    res.status(500);
  }
};

export const signout = async (req, res) => {
  const { id } = req.body;

  // get token from cookie
  const token = req.headers.cookie?.split("=")[1];

  // if there's no token return status 204
  if (!token) return res.status(204);

  try {
    // decode token
    const user = jwtDecode(token);

    // if the user trying to sign out is not the user that has the profile then throw an error
    if (user?.username !== id)
      return res.status(401).json("You aren't allowed to perform this action");

    // clear cookie
    res.cookie("token", token, {
      httpOnly: false,
      path: "/",
      sameSite: "None",
      secure: true,
      maxAge: new Date(0),
    });

    res.status(200).json("logout success");
  } catch (error) {
    res.status(500);
  }
};

export const getUser = async (req, res) => {
  // get token from cookie
  const token = req.headers?.cookie?.split("=")[1];

  if (!token) return res.status(204).json("Not found");

  try {
    // find logged in user based on token
    const { username } = jwtDecode(token);

    const user = await User.findOne({ username });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUserProfile = async (req, res) => {
  const { id: username } = req.params;

  try {
    // find user in db
    const user = await User.findOne({ username });

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
  }
};

export const getSuggestions = async (req, res) => {
  const { id } = req.params;

  try {
    // get a list of all available users
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
    res.status(500);
  }
};

export const followUser = async (req, res) => {
  const { followee } = req.body;

  // get token from cookie
  const token = req.headers.cookie?.split("=")[1];

  try {
    // decode token
    const follower = jwtDecode(token);

    if (!token)
      return res.status(404).json("You aren't authorized to do this action");

    if (follower.id === followee)
      return res.status(401).json("You aren't allowed to perform this action");

    // find user in db
    const user = await User.findById(followee);
    // if there is no user found respond with an error
    if (!user) return res.status(404).json({ error: "User not found" });
    // check if user has followed
    const userIsFollowed = user.followers.findIndex(
      (id) => id === follower.username
    );
    // if user hasn't followed it will be equal to -1 and push the follower in user followers array
    if (userIsFollowed === -1) {
      user.followers.push(follower.username);
    } else {
      // if user has followed return those user that haven't followed
      user.followers = user.followers.filter((id) => id !== follower.username);
    }
    // find the user and update it with the new followers
    const updatedFollowers = await User.findByIdAndUpdate(followee, user, {
      new: true,
    });
    // send back the updated followers to properly update the state in UI
    res.status(200).json(updatedFollowers);
  } catch (error) {
    res.status(500);
  }
};

export const editUserDescription = async (req, res) => {
  const { description } = req.body;
  const { id: username } = req.params;

  // get token from cookie
  const token = req.headers.cookie?.split("=")[1];

  if (!token)
    return res.status(404).json("You aren't authorized to do this action");

  try {
    // decode token
    const match = jwtDecode(token);

    // check if profile username matches user trying to modify it
    if (match.username !== username)
      return res.status(401).json("You aren't allowed to perform this action");

    // find user and update its description with the new description
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { description: description },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500);
  }
};

// edit user Image
export const editUserImage = async (req, res) => {
  const { image, id: username } = req.body;

  // get token from cookie
  const token = req.headers.cookie?.split("=")[1];

  if (!token)
    return res.status(404).json("You aren't authorized to do this action");

  try {
    // decode token
    const match = jwtDecode(token);

    // check if profile username matches user trying to modify it
    if (match.username !== username)
      return res.status(401).json("You aren't allowed to perform this action");

    const user = await User.findOneAndUpdate(
      { username },
      { image: image },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
  }
};
