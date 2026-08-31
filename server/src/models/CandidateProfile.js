import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      trim: true,
      required: true,
    },

    degree: {
      type: String,
      trim: true,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      default: "",
    },

    startYear: {
      type: String,
      default: "",
    },

    endYear: {
      type: String,
      default: "",
    },

    current: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  },
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      required: true,
    },

    jobTitle: {
      type: String,
      trim: true,
      required: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    startDate: {
      type: String,
      default: "",
    },

    endDate: {
      type: String,
      default: "",
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  },
);

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    professionalTitle: {
      type: String,
      trim: true,
      default: "",
    },

    summary: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    github: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    resumeOriginalName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const CandidateProfile = mongoose.model(
  "CandidateProfile",
  candidateProfileSchema,
);

export default CandidateProfile;