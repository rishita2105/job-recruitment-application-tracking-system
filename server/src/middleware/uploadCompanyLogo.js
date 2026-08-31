import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const logoDirectory = path.join(
  process.cwd(),
  "uploads",
  "company-logos",
);

fs.mkdirSync(logoDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, logoDirectory);
  },

  filename(request, file, callback) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename =
      `company-${request.user._id}-${Date.now()}${extension}`;

    callback(null, filename);
  },
});

function fileFilter(request, file, callback) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Only JPG, PNG and WebP logos are allowed",
    );

    error.status = 400;

    return callback(error);
  }

  callback(null, true);
}

const uploadCompanyLogo = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export default uploadCompanyLogo;