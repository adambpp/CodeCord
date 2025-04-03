const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    // Get token from the header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided",
      });
    }

    // Get the token which is the stuff after "Bearer "
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user data to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error: ", error.message);
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Invalid token",
    });
  }
};

//Admin-only middleware - must be used after authenticateUser
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Forbidden - Admin access required",
    });
  }

  next();
};

module.exports = { authenticateUser, requireAdmin };
