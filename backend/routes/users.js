const express = require("express");
const usersController = require("../controllers/usersController");
const { authenticateUser, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Public routes
router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);

// Protected routes
router.get("/profile", authenticateUser, usersController.getProfile);

// Admin Routes
router.get("/all", authenticateUser, requireAdmin, usersController.getAllUsers);
router.delete(
  "/:userId",
  authenticateUser,
  requireAdmin,
  usersController.deleteUser
);

module.exports = router;
