const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// This is so I can load environment variables from my .env file
dotenv.config();

// Store mySQL connection information
const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "web_project",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function that is used in initDatabase()
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initDatabase() {
  let retries = 15;
  // Let it try a few times as SQL might not be ready immediately when the docker container starts up
  while (retries) {
    try {
      // Check if tables exist, create them if they don't
      const connection = await pool.getConnection();

      try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic VARCHAR(2048) NOT NULL,
                description TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Database initialized");
        return;
      } finally {
        // Release connection back to pool
        connection.release();
      }
    } catch (error) {
      console.error(
        `Error initializing database (${retries} retries left):`,
        error.message
      );
      retries -= 1;
      if (retries === 0) {
        console.error("Failed to initialize database after multiple attempts");
        process.exit(1);
      }
      // Wait before retrying
      console.log("Waiting 5 seconds before retrying");
      await sleep(5000);
    }
  }
}

// Call the function to initialize the database when the app starts
initDatabase();

// Export the promised pool so other files can easily use it
module.exports = pool;
