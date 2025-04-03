const express = require("express");
const channelsController = require("../controllers/channelsController");
const { authenticateUser, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// MIGHT NEED TO ADD AUTHENICATE USER TO ALL ENDPOINTS IF ERRORS ARE HAPPENING!!

// Route for retrieving all channels
router.get("/", channelsController.getAllChannels);

// Route for creating a new channel
router.post("/newChannel", channelsController.createChannel);

// Admin route for deleting a channel
router.delete(
  "/:channelId",
  authenticateUser,
  requireAdmin,
  channelsController.deleteChannel
);

module.exports = router;
