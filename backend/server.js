const express = require("express");
const cors = require("cors");
const channelsRoutes = require("./routes/channels");
const messageAndReplyRoutes = require("./routes/messages");
const usersRoutes = require("./routes/users");
const votingRoutes = require("./routes/votes");
const { authenticateUser } = require("./middleware/auth");

const app = express();

// Add CORS middleware
// This allows all origins by default
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend only
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

// I could do this instead and then I wouldn't need CORS, but then I would have to make a static build everytime I want to test something
// app.use(express.static('build'));

// Parse JSON bodies
app.use(express.json());

// User routes (unprotected)
app.use("/api/users", usersRoutes);

// Protected routes - these routes require a user to be signed in to access
app.use("/api/channels", channelsRoutes);
app.use("/api/posts", messageAndReplyRoutes);
app.use("/api/votes", votingRoutes);

// Start server
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
