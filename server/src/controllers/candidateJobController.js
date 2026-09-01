import mongoose from "mongoose";

import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import SavedJob from "../models/SavedJob.js";

async function findActiveJob(jobId) {
  return Job.findOne({
    _id: jobId,
    status: "active",

    applicationDeadline: {
      $gte: new Date(),
    },
  });
}

export async function getJobActionStatus(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const [savedJob, application] =
      await Promise.all([
        SavedJob.findOne({
          candidate: request.user._id,
          job: jobId,
        }),

        Application.findOne({
          candidate: request.user._id,
          job: jobId,
        }),
      ]);

    response.status(200).json({
      success: true,
      saved: Boolean(savedJob),
      applied: Boolean(application),

      applicationStatus:
        application?.status || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveJob(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await findActiveJob(jobId);

    if (!job) {
      return response.status(404).json({
        success: false,
        message:
          "This job is unavailable, closed or expired",
      });
    }

    await SavedJob.findOneAndUpdate(
      {
        candidate: request.user._id,
        job: jobId,
      },
      {
        $setOnInsert: {
          candidate: request.user._id,
          job: jobId,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    response.status(201).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function unsaveJob(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    await SavedJob.findOneAndDelete({
      candidate: request.user._id,
      job: jobId,
    });

    response.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    next(error);
  }
}

export async function getSavedJobs(
  request,
  response,
  next,
) {
  try {
    const savedRecords = await SavedJob.find({
      candidate: request.user._id,
    })
      .populate({
        path: "job",

        populate: {
          path: "company",
          select:
            "name logoUrl industry location",
        },
      })
      .sort({
        createdAt: -1,
      });

    const savedJobs = savedRecords
      .filter((record) => record.job)
      .map((record) => ({
        savedRecordId: record._id,
        savedAt: record.createdAt,
        job: record.job,
      }));

    response.status(200).json({
      success: true,
      savedJobs,
    });
  } catch (error) {
    next(error);
  }
}

export async function applyForJob(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;
    const { coverLetter = "" } = request.body;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await findActiveJob(jobId);

    if (!job) {
      return response.status(404).json({
        success: false,
        message:
          "This job is unavailable, closed or expired",
      });
    }

    const existingApplication =
      await Application.findOne({
        job: jobId,
        candidate: request.user._id,
      });

    if (existingApplication) {
      return response.status(409).json({
        success: false,
        message:
          "You have already applied for this job",
      });
    }

    const profile =
      await CandidateProfile.findOne({
        user: request.user._id,
      });

    if (!profile) {
      return response.status(400).json({
        success: false,
        message:
          "Complete your candidate profile before applying",
      });
    }

    if (!profile.resumeUrl) {
      return response.status(400).json({
        success: false,
        message:
          "Upload your resume before applying",
      });
    }

    const application =
      await Application.create({
        job: job._id,
        candidate: request.user._id,
        recruiter: job.recruiter,
        company: job.company,
        resumeUrl: profile.resumeUrl,
        coverLetter: coverLetter.trim(),
        status: "applied",

        statusHistory: [
          {
            status: "applied",
            changedAt: new Date(),
          },
        ],
      });

    await Job.findByIdAndUpdate(job._id, {
      $inc: {
        applicationsCount: 1,
      },
    });

    await SavedJob.findOneAndDelete({
      candidate: request.user._id,
      job: job._id,
    });

    response.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message:
          "You have already applied for this job",
      });
    }

    next(error);
  }
}

export async function getMyApplications(
  request,
  response,
  next,
) {
  try {
    const applications =
      await Application.find({
        candidate: request.user._id,
      })
        .populate({
          path: "job",

          select:
            "title location workMode employmentType experienceLevel applicationDeadline status",

          populate: {
            path: "company",

            select:
              "name logoUrl industry location",
          },
        })
        .sort({
          appliedAt: -1,
        });

    response.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
}