import mongoose from "mongoose";

import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";

const recruiterStatuses = [
  "under_review",
  "shortlisted",
  "selected",
  "rejected",
];

async function addProfilesToApplications(
  applications,
) {
  const candidateIds = applications
    .map((application) =>
      application.candidate?._id?.toString(),
    )
    .filter(Boolean);

  const profiles = await CandidateProfile.find({
    user: {
      $in: candidateIds,
    },
  }).lean();

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.user.toString(),
      profile,
    ]),
  );

  return applications.map((application) => {
    const applicationObject =
      application.toObject();

    const candidateId =
      application.candidate?._id?.toString();

    return {
      ...applicationObject,

      candidateProfile:
        profileMap.get(candidateId) || null,
    };
  });
}

export async function getAllRecruiterApplications(
  request,
  response,
  next,
) {
  try {
    const { status, jobId } = request.query;

    const filter = {
      recruiter: request.user._id,
    };

    if (
      status &&
      [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (jobId) {
      if (!mongoose.isValidObjectId(jobId)) {
        return response.status(400).json({
          success: false,
          message: "Invalid job ID",
        });
      }

      filter.job = jobId;
    }

    const applications =
      await Application.find(filter)
        .populate(
          "candidate",
          "name email status",
        )
        .populate(
          "job",
          "title status location workMode employmentType",
        )
        .populate(
          "company",
          "name logoUrl",
        )
        .sort({
          appliedAt: -1,
        });

    const enrichedApplications =
      await addProfilesToApplications(
        applications,
      );

    response.status(200).json({
      success: true,
      count: enrichedApplications.length,
      applications: enrichedApplications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobApplications(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;
    const { status } = request.query;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      recruiter: request.user._id,
    }).populate("company", "name logoUrl");

    if (!job) {
      return response.status(404).json({
        success: false,
        message:
          "Job not found or you do not own this job",
      });
    }

    const filter = {
      job: jobId,
      recruiter: request.user._id,
    };

    if (
      status &&
      [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
      ].includes(status)
    ) {
      filter.status = status;
    }

    const applications =
      await Application.find(filter)
        .populate(
          "candidate",
          "name email status",
        )
        .populate(
          "job",
          "title status location workMode employmentType",
        )
        .populate(
          "company",
          "name logoUrl",
        )
        .sort({
          appliedAt: -1,
        });

    const enrichedApplications =
      await addProfilesToApplications(
        applications,
      );

    response.status(200).json({
      success: true,
      job,
      count: enrichedApplications.length,
      applications: enrichedApplications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterApplication(
  request,
  response,
  next,
) {
  try {
    const { applicationId } = request.params;

    if (
      !mongoose.isValidObjectId(applicationId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await Application.findOne({
        _id: applicationId,
        recruiter: request.user._id,
      })
        .populate(
          "candidate",
          "name email status createdAt",
        )
        .populate(
          "job",
          "title location workMode employmentType experienceLevel status",
        )
        .populate(
          "company",
          "name logoUrl industry location",
        );

    if (!application) {
      return response.status(404).json({
        success: false,
        message:
          "Application not found or access denied",
      });
    }

    const candidateProfile =
      await CandidateProfile.findOne({
        user: application.candidate._id,
      });

    response.status(200).json({
      success: true,
      application,
      candidateProfile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(
  request,
  response,
  next,
) {
  try {
    const { applicationId } = request.params;
    const { status } = request.body;

    if (
      !mongoose.isValidObjectId(applicationId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    if (!recruiterStatuses.includes(status)) {
      return response.status(400).json({
        success: false,
        message:
          "Status must be under review, shortlisted, selected or rejected",
      });
    }

    const application =
      await Application.findOne({
        _id: applicationId,
        recruiter: request.user._id,
      });

    if (!application) {
      return response.status(404).json({
        success: false,
        message:
          "Application not found or access denied",
      });
    }

    if (application.status === status) {
      return response.status(200).json({
        success: true,
        message:
          "Application already has this status",
        application,
      });
    }

    application.status = status;

    application.statusHistory.push({
      status,
      changedAt: new Date(),
    });

    await application.save();

    const updatedApplication =
      await Application.findById(
        application._id,
      )
        .populate(
          "candidate",
          "name email status",
        )
        .populate(
          "job",
          "title location workMode employmentType",
        )
        .populate(
          "company",
          "name logoUrl",
        );

    response.status(200).json({
      success: true,
      message: `Application marked as ${status.replaceAll(
        "_",
        " ",
      )}`,
      application: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
}