const express = require("express");
const cors = require("cors");
const channelsRoutes = require("./routes/channels");
const messageAndReplyRoutes = require("./routes/messages");

const app = express();

// Add CORS middleware
// This allows all origins by default
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend only
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// I could do this instead and then I wouldn't need CORS, but then I would have to make a static build everytime I want to test something
// app.use(express.static('build'));

// Parse JSON bodies
app.use(express.json());

// All endpoints in channelsRoutes get prefixed with /api/channels
app.use("/api/channels", channelsRoutes);

// All endpoints in messageAndReplyRoutes get prefixed with /api/posts
app.use("/api/posts", messageAndReplyRoutes);

// Start server
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
