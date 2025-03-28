// Self executing async function should get executed with the import
const CouchDBSetup = require("../db/couchdb.js");
const dotenv = require("dotenv");

dotenv.config();

// Use the getDb promise to ensure database is ready
let db;
CouchDBSetup.getDb
  .then((database) => {
    db = database;
  })
  .catch((error) => {
    console.error("Failed to set up database:", error);
  });

async function postMessage(req, res) {
  const { topic, data, channelId } = req.body;

  if (!topic || !data) {
    return res
      .status(400)
      .json({ success: false, error: "Missing topic or data " });
  }

  if (!channelId) {
    return res
      .status(400)
      .json({ success: false, error: "Channel ID is required" });
  }

  try {
    const newMessage = {
      type: "message",
      channelId: channelId,
      topic,
      data,
      timestamp: new Date().toLocaleString("sv-SE"),
    };

    const response = await db.insert(newMessage);
    res.json({ success: true, id: response.id });
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).json({ success: false, error: "Failed to create message" });
  }
}

async function postReply(req, res) {
  const { messageId, data, parentId } = req.body;

  if (!messageId || !data) {
    return res
      .status(400)
      .json({ success: false, error: "Missing messageId or data" });
  }

  try {
    try {
      await db.get(messageId);
    } catch (error) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    const newReply = {
      type: "reply",
      messageId,
      data,
      timestamp: new Date().toLocaleString("sv-SE"),
      // Optional: parentId to indicate a nested reply
      ...(parentId && { parentId }),
    };

    const replyDB = await db.insert(newReply);
    res.json({ success: true, id: replyDB.id });
  } catch (error) {
    console.error("Error adding response: ", error);
    res.status(500).json({ success: false, error: "Failed to add reply" });
  }
}

// Might be better to filter messages by channel here instead of doing it in the
// frontend later
async function getAllMessagesAndReplies(req, res) {
  try {
    const messagesResult = await db.view("app", "message");
    const messages = messagesResult.rows.map((row) => row.value);

    const repliesResult = await db.view("app", "reply_by_message");
    const replies = repliesResult.rows.map((row) => row.value);

    res.json({ messages, replies });
  } catch (error) {
    console.error("Detailed Error Fetching Data: ", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch data",
      details: error.message,
    });
  }
}

module.exports = { postMessage, postReply, getAllMessagesAndReplies };
