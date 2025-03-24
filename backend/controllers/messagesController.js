// Self executing async function should get executed with the import
const CouchDBSetup = require("../db/couchdb.js");
const dotenv = require("dotenv");

dotenv.config();

const db = CouchDBSetup.Cdb;

// Pass in channel Id to this function so I can associate it with its
// respective channel without having to query from mySQL here
async function postMessage(req, res, channelId) {
  const { topic, data } = req.body;

  if (!topic || !data) {
    return res
      .status(400)
      .json({ success: false, error: "Missing topic or data " });
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
    res.status(500).json({ sucess: false, error: "Failed to create message" });
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

async function getAllMessagesAndReplies() {
  try {
    const messagesResult = await db.view("app", "messages");
    const messages = messagesResult.rows.map((row) => row.value);

    const repliesResult = await db.view("app", "reply_by_message");
    const replies = repliesResult.rows.map((row) => row.value);

    res.json({ messages, replies });
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
}
