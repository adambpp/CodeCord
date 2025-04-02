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
  const { topic, data, imageUrl, channelId } = req.body;

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
      ...(imageUrl && { imageUrl: imageUrl }),
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
  const { messageId, data, imageUrl, parentId } = req.body;

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
      ...(imageUrl && { imageUrl: imageUrl }),
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

// ADMIN function for deleting a message
async function deleteMessage(req, res) {
  const { messageId } = req.params;

  try {
    try {
      await db.get(messageId);
    } catch (error) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    // Delete the message
    await db.destroy(messageId, (await db.get(messageId))._rev);

    // Find and delete all replies to this message
    const repliesResult = await db.view("app", "reply_by_message", {
      key: messageId,
    });

    // Delete each reply
    for (const row of repliesResult.rows) {
      const reply = row.value;
      await db.destroy(reply._id, reply._rev);
    }

    return res.status(200).json({
      success: true,
      message: "Message and all replies deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete message" });
  }
}

// ADMIN function for deleting a reply
async function deleteReply(req, res) {
  const { replyId } = req.params;

  try {
    // Check if reply exists and is actually a reply
    let reply;
    try {
      reply = await db.get(replyId);

      if (reply.type !== "reply") {
        return res.status(400).json({
          success: false,
          error: "Document is not a reply",
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "Reply not found",
      });
    }

    // Delete the reply
    await db.destroy(replyId, reply._rev);

    return res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reply: ", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete reply",
    });
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

async function getSingleMessageAndReplies(req, res) {
  const messageId = req.params.messageId;

  if (!messageId) {
    return res
      .status(400)
      .json({ success: false, error: "Message ID is required" });
  }

  try {
    // Get the message document
    let message;
    try {
      message = await db.get(messageId);

      // Verify that this is a message document
      if (message.type !== "message") {
        return res.status(404).json({
          success: false,
          error: "Document is not a message",
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Get all replies for this message using the view
    const repliesResult = await db.view("app", "reply_by_message", {
      key: messageId,
    });

    const replies = repliesResult.rows.map((row) => row.value);

    res.json({
      success: true,
      message,
      replies,
    });
  } catch (error) {
    console.error("Error fetching message and replies: ", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch message and replies",
      details: error.message,
    });
  }
}

module.exports = {
  postMessage,
  postReply,
  getAllMessagesAndReplies,
  getSingleMessageAndReplies,
  deleteMessage,
  deleteReply,
};
