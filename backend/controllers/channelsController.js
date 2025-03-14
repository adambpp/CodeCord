import db from "../db/mysql.js";

// Function that will get used in a GET request to retrive all channels
export async function getAllChannels(req, res) {
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
export async function createChannel(req, res) {
  try {
    const { topic, description } = req.body;

    if (!topic || !description) {
      return res
        .status(400)
        .json({ error: "Missing required fields: topic or description " });
    }

    const [result] = await db.query(
      "INSERT INTO channels (topic, description) VALUES (?, ?)",
      [topic, description]
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
