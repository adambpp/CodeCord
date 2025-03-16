import express from "express";
const channelsController = require("../controllers/channelsController");
const router = express.Router();

// Route for retrieving all channels
router.get("/", channelsController.getAllChannels);

// Route for creating a new channel
router.post("/newChannel", channelsController.createChannel);

module.exports = router;
