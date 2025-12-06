import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // ✅ FIRST TRY COOKIE
    let token = req.cookies?.token;

    // ✅ FALLBACK TO AUTH HEADER (IMPORTANT FIX)
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token. Authentication required",
      });
    }

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // ✅ ATTACH USER ID
    req.id = decoded.userId;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again",
    });
  }
};

export default isAuthenticated;
