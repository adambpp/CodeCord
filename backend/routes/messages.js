const express = require("express");
const messagesController = require("../controllers/messagesController");
const router = express.Router();

// Get route for retrieving all messages and replies
router.get("/", messagesController.getAllMessagesAndReplies);

// Post route for making a new message in a channel
router.post("/newMessage", (req, res) => {
  // Get channelId from URL (i.e., /api/newMessage?channel=1)
  const channelId = req.query.channel;
  if (!channelId) {
    return res
      .status(400)
      .json({ success: false, error: "Channel ID is required" });
  }
  messagesController.postMessage(req, res, channelId);
});

// Post route for replying to an existing message in a channel
router.post("/newReply", messagesController.postReply);

module.exports = router;
