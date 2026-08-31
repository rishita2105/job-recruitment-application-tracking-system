import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const resumeDirectory = path.join(
  process.cwd(),
  "uploads",
  "resumes",
);

fs.mkdirSync(resumeDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, resumeDirectory);
  },

  filename(request, file, callback) {
    const filename = `resume-${request.user._id}-${Date.now()}.pdf`;

    callback(null, filename);
  },
});

function fileFilter(request, file, callback) {
  const isPdf =
    file.mimetype === "application/pdf" &&
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (!isPdf) {
    const error = new Error("Only PDF resumes are allowed");
    error.status = 400;

    return callback(error);
  }

  callback(null, true);
}

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadResume;