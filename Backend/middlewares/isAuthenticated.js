import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // IMPORTANT: All your controllers expect req.id
    req.id = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication error: Invalid or expired token",
    });
  }
};

export default isAuthenticated;
