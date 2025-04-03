const express = require("express");
const messagesController = require("../controllers/messagesController");
const { authenticateUser, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Get route for retrieving all messages and replies
router.get("/", messagesController.getAllMessagesAndReplies);

// Get route for retrieving a single message and its replies
router.get("/:messageId", messagesController.getSingleMessageAndReplies);

// Post route for making a new message in a channel
router.post("/newMessage", messagesController.postMessage);

// Post route for replying to an existing message in a channel
router.post("/newReply", messagesController.postReply);

// Admin routes for deletes messages and replies
router.delete(
  "/message/:messageId",
  authenticateUser,
  requireAdmin,
  messagesController.deleteMessage
);
router.delete(
  "/reply/:replyId",
  authenticateUser,
  requireAdmin,
  messagesController.deleteReply
);

module.exports = router;
