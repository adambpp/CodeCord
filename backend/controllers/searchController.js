// /src/controllers/searchController.js
const CouchDBSetup = require("../db/couchdb.js");
const db = require("../db/mysql.js");
const dotenv = require("dotenv");

dotenv.config();

// Get CouchDB connection
let couchDb;
CouchDBSetup.getDb
  .then((database) => {
    couchDb = database;
  })
  .catch((error) => {
    console.error("Failed to set up database:", error);
  });

// Search content for specific strings
async function searchContent(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    // Search in messages
    const messagesResult = await couchDb.view("app", "message");
    const messages = messagesResult.rows
      .map((row) => row.value)
      .filter(
        (message) =>
          message.topic.toLowerCase().includes(query.toLowerCase()) ||
          message.data.toLowerCase().includes(query.toLowerCase())
      );

    // Search in replies
    const repliesResult = await couchDb.view("app", "reply_by_message");
    const replies = repliesResult.rows
      .map((row) => row.value)
      .filter((reply) =>
        reply.data.toLowerCase().includes(query.toLowerCase())
      );

    // Combine results
    const results = [...messages, ...replies];

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error searching content:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to search content",
    });
  }
}

// Search content by specific user
async function searchUserContent(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    // Get messages by user
    const messagesResult = await couchDb.view("app", "message");
    const userMessages = messagesResult.rows
      .map((row) => row.value)
      .filter(
        (message) => message.user.toLowerCase() === username.toLowerCase()
      );

    // Get replies by user
    const repliesResult = await couchDb.view("app", "reply_by_message");
    const userReplies = repliesResult.rows
      .map((row) => row.value)
      .filter((reply) => reply.user.toLowerCase() === username.toLowerCase());

    // Combine results
    const results = [...userMessages, ...userReplies];

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error searching user content:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to search user content",
    });
  }
}

// Get user stats (most/least posts)
async function getUserStats(req, res) {
  try {
    const { sort } = req.query;

    if (!sort || !["most-posts", "least-posts"].includes(sort)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort parameter",
      });
    }

    // Get all messages and replies
    const messagesResult = await couchDb.view("app", "message");
    const messages = messagesResult.rows.map((row) => row.value);

    const repliesResult = await couchDb.view("app", "reply_by_message");
    const replies = repliesResult.rows.map((row) => row.value);

    // Combine and count posts by user
    const combinedPosts = [...messages, ...replies];
    const userCounts = {};

    combinedPosts.forEach((post) => {
      const username = post.user;
      if (!userCounts[username]) {
        userCounts[username] = 0;
      }
      userCounts[username]++;
    });

    // Get user details from MySQL
    const [users] = await db.query("SELECT username, name FROM users");

    // Create result array with user details and post counts
    const results = users.map((user) => ({
      username: user.username,
      name: user.name,
      postCount: userCounts[user.username] || 0,
    }));

    // Sort based on parameter
    if (sort === "most-posts") {
      results.sort((a, b) => b.postCount - a.postCount);
    } else {
      results.sort((a, b) => a.postCount - b.postCount);
    }

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get user stats",
    });
  }
}

// Get content by ranking
async function getContentByRanking(req, res) {
  try {
    const { sort } = req.query;

    if (!sort || !["highest", "lowest"].includes(sort)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort parameter",
      });
    }

    // Get all messages and replies
    const messagesResult = await couchDb.view("app", "message");
    const messages = messagesResult.rows.map((row) => row.value);

    const repliesResult = await couchDb.view("app", "reply_by_message");
    const replies = repliesResult.rows.map((row) => row.value);

    // Combine all content
    const allContent = [...messages, ...replies];

    // Get votes for each content item
    const enrichedContent = await Promise.all(
      allContent.map(async (item) => {
        const votesResult = await couchDb.view("app", "votes_by_doc", {
          key: item._id,
        });

        const votes = votesResult.rows.map((row) => row.value);
        const upvotes = votes.filter(
          (vote) => vote.voteType === "upvote"
        ).length;
        const downvotes = votes.filter(
          (vote) => vote.voteType === "downvote"
        ).length;
        const score = upvotes - downvotes;

        return {
          ...item,
          upvotes,
          downvotes,
          score,
        };
      })
    );

    // Sort based on parameter
    if (sort === "highest") {
      enrichedContent.sort((a, b) => b.score - a.score);
    } else {
      enrichedContent.sort((a, b) => a.score - b.score);
    }

    return res.status(200).json({
      success: true,
      results: enrichedContent,
    });
  } catch (error) {
    console.error("Error getting ranked content:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get ranked content",
    });
  }
}

module.exports = {
  searchContent,
  searchUserContent,
  getUserStats,
  getContentByRanking,
};
