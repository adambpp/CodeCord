const express = require("express");
const messagesController = require("../controllers/messagesController");
const router = express.Router();

// Get route for retrieving all messages and replies
router.get("/", messagesController.getAllMessagesAndReplies);

// Post route for making a new message in a channel
router.post("/newMessage", messagesController.postMessage);

// Post route for replying to an existing message in a channel
router.post("/newReply", messagesController.postReply);

module.exports = router;
