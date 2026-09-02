import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

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
      index: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      min: 15,
      max: 480,
      default: 60,
    },

    interviewType: {
      type: String,
      enum: ["online", "offline", "phone"],
      required: true,
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema,
);

export default Interview;