// Backend/middlewares/multer.js
import multer from "multer";

// ---------------------------------------------
// IN-MEMORY STORAGE (best for Cloudinary upload)
// ---------------------------------------------
const storage = multer.memoryStorage();

// ---------------------------------------------
// ALLOWED FILE TYPES
// ---------------------------------------------
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// ---------------------------------------------
// MULTER INSTANCE
// ---------------------------------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true);
    }

    if (ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only PNG, JPG, JPEG, and WEBP image files are allowed")
    );
  },
});

// ---------------------------------------------
// OPTIONAL GLOBAL MULTER ERROR HANDLER
// Use this in routes only if you want explicit upload error handling
// ---------------------------------------------
export const uploadErrorHandler = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Image size must be less than 5MB"
          : err.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "File upload failed",
  });
};

export default upload;