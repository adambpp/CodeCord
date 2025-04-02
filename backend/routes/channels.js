const express = require("express");
const channelsController = require("../controllers/channelsController");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Route for retrieving all channels
router.get("/", channelsController.getAllChannels);

// Route for creating a new channel
router.post("/newChannel", channelsController.createChannel);

// Admin route for deleting a channel
router.delete("/:channelId", requireAdmin, channelsController.deleteChannel);

module.exports = router;
