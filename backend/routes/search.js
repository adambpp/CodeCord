// /src/routes/search.js
const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const searchController = require("../controllers/searchController");

// All search routes require authentication
router.use(authenticateUser);

// Search routes
router.get("/content", searchController.searchContent);
router.get("/user-content", searchController.searchUserContent);
router.get("/user-stats", searchController.getUserStats);
router.get("/ranking", searchController.getContentByRanking);

module.exports = router;
