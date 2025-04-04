const nano = require("nano");
const dotenv = require("dotenv");

dotenv.config();

const couchUrl =
  process.env.COUCHDB_URL || "http://admin:password@localhost:5984";
const couch = nano(couchUrl);
const dbName = process.env.COUCHDB_DB_NAME || "messages_and_replies";

// Separate the setup function from the export
async function setupDatabase() {
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to set up CouchDB...`);

      // Check if database exists, create it if it doesn't
      const dbList = await couch.db.list();
      if (!dbList.includes(dbName)) {
        await couch.db.create(dbName);
        console.log(`Database ${dbName} created.`);
      }

      // Get reference to the database
      const db = couch.use(dbName);

      // Define design document with views for efficient querying
      const designDoc = {
        _id: "_design/app", // CouchDB design documents always start with _design/
        views: {
          // View to retrieve all message documents
          message: {
            map: function (doc) {
              if (doc.type === "message") {
                emit(doc._id, doc);
              }
            }.toString(),
          },
          // View to retrieve all replies (including nested ones) organized by messageId
          reply_by_message: {
            map: function (doc) {
              if (doc.type === "reply") {
                emit(doc.messageId, doc);
              }
            }.toString(),
          },
          // View to retrieve all votes by document ID
          votes_by_doc: {
            map: function (doc) {
              if (doc.type === "vote") {
                emit(doc.documentId, doc);
              }
            }.toString(),
          },
          // View to retrieve user's votes
          votes_by_user: {
            map: function (doc) {
              if (doc.type === "vote") {
                emit([doc.username, doc.documentId], doc);
              }
            }.toString(),
          },
        },
      };

      // Update or create the design document
      try {
        const existingDesignDoc = await db.get("_design/app");
        designDoc._rev = existingDesignDoc._rev;
        await db.insert(designDoc);
        console.log("Design document updated successfully");
      } catch (err) {
        if (err.statusCode === 404) {
          await db.insert(designDoc);
          console.log("Design document created successfully");
        } else {
          throw err;
        }
      }

      console.log("CouchDB setup completed successfully!");
      return db; // Return the database connection
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        console.error("Max retries reached. Setup failed.");
        process.exit(1);
      }
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

// Export an object with the setup function and a promise for the db connection
module.exports = {
  setupDatabase,
  getDb: setupDatabase(), // This creates a promise that resolves to the db connection
};
