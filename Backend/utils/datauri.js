// Backend/utils/getDataUri.js
import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  try {
    if (!file || !file.buffer) return null;

    const originalName = file.originalname || "image.jpg";
    const extension = path.extname(originalName).toLowerCase() || ".jpg";

    const result = parser.format(extension, file.buffer);

    return result.content || null;
  } catch (error) {
    console.error("❌ DataUri conversion error:", error.message);
    return null;
  }
};

export default getDataUri;