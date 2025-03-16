import express from "express";
const channelsRoutes = require("./routes/channels");

const app = express();

// Parse JSON bodies
app.use(express.json());

// All endpoints in channelsRoutes get prefixed with /api/channels
app.use("/api/channels", channelsRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
