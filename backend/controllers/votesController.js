// votesController.js
const CouchDBSetup = require("../db/couchdb.js");
const dotenv = require("dotenv");

dotenv.config();

// Use the getDb promise to ensure database is ready
let db;
CouchDBSetup.getDb
  .then((database) => {
    db = database;
  })
  .catch((error) => {
    console.error("Failed to set up database:", error);
  });

// Function to vote on a message or reply
async function vote(req, res) {
  const { documentId, voteType } = req.body;
  const username = req.user.username;

  if (!documentId || !voteType || !["upvote", "downvote"].includes(voteType)) {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid parameters",
    });
  }

  try {
    // First, verify the document exists
    try {
      await db.get(documentId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has already voted on this document
    const userVoteResults = await db.view("app", "votes_by_user", {
      key: [username, documentId],
    });

    let existingVote = null;
    if (userVoteResults.rows.length > 0) {
      existingVote = userVoteResults.rows[0].value;
    }

    if (existingVote) {
      // User already voted - let's update their vote
      if (existingVote.voteType === voteType) {
        // User is voting the same way - remove their vote
        await db.destroy(existingVote._id, existingVote._rev);

        return res.status(200).json({
          success: true,
          message: "Vote removed",
        });
      } else {
        // User is changing their vote
        existingVote.voteType = voteType;
        await db.insert(existingVote);

        return res.status(200).json({
          success: true,
          message: "Vote updated",
        });
      }
    } else {
      // New vote
      const newVote = {
        type: "vote",
        documentId,
        username,
        voteType,
        timestamp: new Date().toISOString(),
      };

      await db.insert(newVote);

      return res.status(200).json({
        success: true,
        message: "Vote recorded",
      });
    }
  } catch (error) {
    console.error("Error voting:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process vote",
    });
  }
}

// Function to get votes for a document
async function getVotes(req, res) {
  const { documentId } = req.params;
  const username = req.user.username;

  if (!documentId) {
    return res.status(400).json({
      success: false,
      error: "Document ID is required",
    });
  }

  try {
    // Get all votes for the document
    const votesResult = await db.view("app", "votes_by_doc", {
      key: documentId,
    });

    const votes = votesResult.rows.map((row) => row.value);

    // Count upvotes and downvotes
    const upvotes = votes.filter((vote) => vote.voteType === "upvote").length;
    const downvotes = votes.filter(
      (vote) => vote.voteType === "downvote"
    ).length;

    // Check if user has voted on this document
    const userVote = votes.find((vote) => vote.username === username);

    return res.status(200).json({
      success: true,
      upvotes,
      downvotes,
      userVote: userVote ? userVote.voteType : null,
    });
  } catch (error) {
    console.error("Error getting votes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get votes",
    });
  }
}

// Get votes for multiple documents at once
async function getBulkVotes(req, res) {
  const { documentIds } = req.body;
  const username = req.user.username;

  if (!documentIds || !Array.isArray(documentIds)) {
    return res.status(400).json({
      success: false,
      error: "Document IDs array is required",
    });
  }

  try {
    const results = {};

    // For each document ID, get all votes
    for (const documentId of documentIds) {
      const votesResult = await db.view("app", "votes_by_doc", {
        key: documentId,
      });

      const votes = votesResult.rows.map((row) => row.value);
      const upvotes = votes.filter((vote) => vote.voteType === "upvote").length;
      const downvotes = votes.filter(
        (vote) => vote.voteType === "downvote"
      ).length;
      const userVote = votes.find((vote) => vote.username === username);

      results[documentId] = {
        upvotes,
        downvotes,
        userVote: userVote ? userVote.voteType : null,
      };
    }

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error getting bulk votes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get votes",
    });
  }
}

module.exports = {
  vote,
  getVotes,
  getBulkVotes,
};
