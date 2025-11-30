import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {

  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please login."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again."
    });
  }
};

export default isAuthenticated;
