const nano = require("nano");
const dotenv = require("dotenv");

// This is so I can load environment variables from my .env file
dotenv.config();

const couchUrl =
  process.env.COUCHDB_URL || "http://admin:password@localhost:5984";
const couch = nano(couchUrl);
const dbName = process.env.COUCHDB_DB_NAME || "post_and_messages";

module.exports = (async function CouchDBSetup() {
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
          posts: {
            map: function (doc) {
              if (doc.type === "messages") {
                emit(doc._id, doc);
              }
            }.toString(),
          },
          // View to retrieve all replies (including nested ones) organized by messageId
          reply_by_message: {
            map: function (doc) {
              if (doc.type === "replies") {
                emit(doc.messageId, doc);
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
      return; // Exit the retry loop on success
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
})();
