import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Cover letter cannot exceed 2000 characters",
      ],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
      ],
      default: "applied",
      index: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [
        {
          status: "applied",
          changedAt: new Date(),
        },
      ],
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index(
  {
    job: 1,
    candidate: 1,
  },
  {
    unique: true,
  },
);

const Application = mongoose.model(
  "Application",
  applicationSchema,
);

export default Application;