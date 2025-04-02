const db = require("../db/mysql.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

async function registerUser(req, res) {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Check if username already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "Username already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const [result] = await db.query(
      "INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
      [username, hashedPassword, name]
    );

    // Return success without password
    return res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        username,
        name,
      },
    });
  } catch (error) {
    console.error("Error registering user: ", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Username and password are required" });
    }

    // Get user from database
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user info and token
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error logging in: ", error);
    return res
      .status(500)
      .json({ success: false, error: "Interal Server Error" });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const [users] = await db.query(
      "SELECT id, username, name, isAdmin FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Error getting profile: ", error);
    return res
      .statsu(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

// ADMIN ONLY: Get all users
async function getAllUsers(req, res) {
  try {
    const [users] = await db.query(
      "SELECT id, username, name, isAdmin, created_at FROM users"
    );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

// ADMIN ONLY: Delete a user
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    // Don't allow deleting admin user
    const [users] = await db.query("SELECT isAdmin FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (users[0].isAdmin) {
      return res
        .status(403)
        .json({ success: false, error: "Cannot delete admin user" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
};
