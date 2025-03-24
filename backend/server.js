const express = require("express");
const channelsRoutes = require("./routes/channels");
const messageAndReplyRoutes = require("./routes/messages");

const app = express();

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
