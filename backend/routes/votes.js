// In a new file routes/votes.js or add to your existing routes file
const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const votesController = require("../controllers/votesController");

// Vote on a document (message or reply)
router.post("/vote", authenticateUser, votesController.vote);

// Get votes for a single document
router.get("/votes/:documentId", authenticateUser, votesController.getVotes);

// Get votes for multiple documents
router.post("/bulk-votes", authenticateUser, votesController.getBulkVotes);

module.exports = router;
