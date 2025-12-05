import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  if (!file) return null;

  // Ensures extension exists — safest
  const extension = path.extname(file.originalname || "").toLowerCase();

  // Default fallback (important)
  const ext = extension || ".jpg";

  return parser.format(ext, file.buffer).content;
};

export default getDataUri;
