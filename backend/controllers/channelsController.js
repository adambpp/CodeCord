const db = require("../db/mysql.js");

// Function that will get used in a GET request to retrive all channels
async function getAllChannels(req, res) {
  try {
    // Query the channels table
    const [rows] = await db.query(
      "SELECT * FROM channels ORDER BY timestamp DESC"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving channels: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function that will get used in a POST request to create/add a new channel
async function createChannel(req, res) {
  try {
    const { topic, description, created_by } = req.body;

    if (!topic || !description) {
      return res
        .status(400)
        .json({ error: "Missing required fields: topic or description " });
    }

    const [result] = await db.query(
      "INSERT INTO channels (topic, description, created_by) VALUES (?, ?, ?)",
      [topic, description, created_by]
    );

    const [rows] = await db.query("SELECT * FROM channels WHERE id = ?", [
      result.insertId,
    ]);

    // Response code 201 means the request was successful and something got created
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ADMIN function to delete a channel
async function deleteChannel(req, res) {
  try {
    const { channelId } = req.params;

    // Check if channel exists
    const [channels] = await db.query("SELECT * FROM channels WHERE id = ?", [
      channelId,
    ]);

    if (channels.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Delete the channel
    await db.query("DELETE FROM channels WHERE id = ?", [channelId]);

    return res
      .status(200)
      .json({ success: true, message: "Channel deleted successfully " });
  } catch (error) {
    console.error("Error deleting channel: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getAllChannels, createChannel, deleteChannel };
