const express = require("express");
const channelsRoutes = require("./routes/channels");

const app = express();

// Parse JSON bodies
app.use(express.json());

// All endpoints in channelsRoutes get prefixed with /api/channels
app.use("/api/channels", channelsRoutes);

// Start server
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
