import multer from "multer";

// In-memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// Allowed file types
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only PNG, JPG, JPEG, and WEBP formats are allowed"));
  },
});

// ⭐ Global Multer Error Handler
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer built-in errors
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // Custom fileFilter errors
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }
  next();
};

export default upload;

