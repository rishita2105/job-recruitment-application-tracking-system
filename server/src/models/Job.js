import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
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
      index: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [
        120,
        "Job title cannot exceed 120 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [
        5000,
        "Job description cannot exceed 5000 characters",
      ],
    },

    category: {
      type: String,
      required: [true, "Job category is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },

    workMode: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      required: true,
    },

    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "internship",
        "contract",
        "temporary",
      ],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: [
        "fresher",
        "entry-level",
        "mid-level",
        "senior-level",
        "lead",
      ],
      required: true,
    },

    requirements: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    salaryMin: {
      type: Number,
      min: [0, "Minimum salary cannot be negative"],
      default: null,
    },

    salaryMax: {
      type: Number,
      min: [0, "Maximum salary cannot be negative"],
      default: null,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "closed",
        "expired",
      ],
      default: "draft",
      index: true,
    },

    applicationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
  location: "text",
});

const Job = mongoose.model("Job", jobSchema);

export default Job;