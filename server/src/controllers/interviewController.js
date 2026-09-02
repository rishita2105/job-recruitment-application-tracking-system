import mongoose from "mongoose";

import Application from "../models/Application.js";
import Interview from "../models/Interview.js";

function validateInterviewData(body) {
  const {
    scheduledAt,
    durationMinutes,
    interviewType,
    meetingLink,
    location,
    contactPhone,
  } = body;

  const scheduledDate = new Date(scheduledAt);

  if (
    !scheduledAt ||
    Number.isNaN(scheduledDate.getTime())
  ) {
    return "Enter a valid interview date and time";
  }

  if (scheduledDate <= new Date()) {
    return "Interview date and time must be in the future";
  }

  if (
    !["online", "offline", "phone"].includes(
      interviewType,
    )
  ) {
    return "Select a valid interview type";
  }

  if (
    interviewType === "online" &&
    !meetingLink?.trim()
  ) {
    return "Meeting link is required for an online interview";
  }

  if (
    interviewType === "offline" &&
    !location?.trim()
  ) {
    return "Location is required for an offline interview";
  }

  if (
    interviewType === "phone" &&
    !contactPhone?.trim()
  ) {
    return "Phone number is required for a phone interview";
  }

  const duration = Number(durationMinutes);

  if (
    Number.isNaN(duration) ||
    duration < 15 ||
    duration > 480
  ) {
    return "Interview duration must be between 15 and 480 minutes";
  }

  return null;
}

function createInterviewData(body) {
  return {
    scheduledAt: new Date(body.scheduledAt),

    durationMinutes:
      Number(body.durationMinutes) || 60,

    interviewType: body.interviewType,

    meetingLink:
      body.interviewType === "online"
        ? body.meetingLink?.trim() || ""
        : "",

    location:
      body.interviewType === "offline"
        ? body.location?.trim() || ""
        : "",

    contactPhone:
      body.interviewType === "phone"
        ? body.contactPhone?.trim() || ""
        : "",

    notes: body.notes?.trim() || "",
  };
}

function populateInterview(query) {
  return query
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
      "name logoUrl location",
    )
    .populate(
      "application",
      "status coverLetter appliedAt",
    );
}

export async function scheduleInterview(
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

    const validationError =
      validateInterviewData(request.body);

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
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

    if (application.status !== "shortlisted") {
      return response.status(400).json({
        success: false,
        message:
          "Shortlist the candidate before scheduling an interview",
      });
    }

    const existingInterview =
      await Interview.findOne({
        application: applicationId,
      });

    if (existingInterview) {
      return response.status(409).json({
        success: false,
        message:
          "An interview already exists for this application. Use reschedule instead.",
      });
    }

    const interviewData =
      createInterviewData(request.body);

    const interview = await Interview.create({
      ...interviewData,

      application: application._id,
      job: application.job,
      candidate: application.candidate,
      recruiter: request.user._id,
      company: application.company,
      status: "scheduled",
    });

    application.status =
      "interview_scheduled";

    application.statusHistory.push({
      status: "interview_scheduled",
      changedAt: new Date(),
    });

    await application.save();

    const populatedInterview =
      await populateInterview(
        Interview.findById(interview._id),
      );

    response.status(201).json({
      success: true,
      message:
        "Interview scheduled successfully",
      interview: populatedInterview,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterInterviews(
  request,
  response,
  next,
) {
  try {
    const { status } = request.query;

    const filter = {
      recruiter: request.user._id,
    };

    if (
      ["scheduled", "completed", "cancelled"].includes(
        status,
      )
    ) {
      filter.status = status;
    }

    const interviews =
      await populateInterview(
        Interview.find(filter).sort({
          scheduledAt: 1,
        }),
      );

    response.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterInterview(
  request,
  response,
  next,
) {
  try {
    const { interviewId } = request.params;

    if (
      !mongoose.isValidObjectId(interviewId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview =
      await populateInterview(
        Interview.findOne({
          _id: interviewId,
          recruiter: request.user._id,
        }),
      );

    if (!interview) {
      return response.status(404).json({
        success: false,
        message:
          "Interview not found or access denied",
      });
    }

    response.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
}

export async function rescheduleInterview(
  request,
  response,
  next,
) {
  try {
    const { interviewId } = request.params;

    if (
      !mongoose.isValidObjectId(interviewId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const validationError =
      validateInterviewData(request.body);

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      recruiter: request.user._id,
    });

    if (!interview) {
      return response.status(404).json({
        success: false,
        message:
          "Interview not found or access denied",
      });
    }

    const interviewData =
      createInterviewData(request.body);

    Object.assign(interview, interviewData);

    interview.status = "scheduled";

    await interview.save();

    const application =
      await Application.findById(
        interview.application,
      );

    if (
      application &&
      application.status !==
        "interview_scheduled"
    ) {
      application.status =
        "interview_scheduled";

      application.statusHistory.push({
        status: "interview_scheduled",
        changedAt: new Date(),
      });

      await application.save();
    }

    const populatedInterview =
      await populateInterview(
        Interview.findById(interview._id),
      );

    response.status(200).json({
      success: true,
      message:
        "Interview rescheduled successfully",
      interview: populatedInterview,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelInterview(
  request,
  response,
  next,
) {
  try {
    const { interviewId } = request.params;

    if (
      !mongoose.isValidObjectId(interviewId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      recruiter: request.user._id,
    });

    if (!interview) {
      return response.status(404).json({
        success: false,
        message:
          "Interview not found or access denied",
      });
    }

    interview.status = "cancelled";

    await interview.save();

    const application =
      await Application.findById(
        interview.application,
      );

    if (application) {
      application.status = "shortlisted";

      application.statusHistory.push({
        status: "shortlisted",
        changedAt: new Date(),
      });

      await application.save();
    }

    response.status(200).json({
      success: true,
      message: "Interview cancelled",
      interview,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeInterview(
  request,
  response,
  next,
) {
  try {
    const { interviewId } = request.params;

    if (
      !mongoose.isValidObjectId(interviewId)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      recruiter: request.user._id,
    });

    if (!interview) {
      return response.status(404).json({
        success: false,
        message:
          "Interview not found or access denied",
      });
    }

    if (interview.status === "cancelled") {
      return response.status(400).json({
        success: false,
        message:
          "A cancelled interview cannot be completed",
      });
    }

    interview.status = "completed";

    await interview.save();

    response.status(200).json({
      success: true,
      message:
        "Interview marked as completed",
      interview,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCandidateInterviews(
  request,
  response,
  next,
) {
  try {
    const interviews =
      await populateInterview(
        Interview.find({
          candidate: request.user._id,
        }).sort({
          scheduledAt: 1,
        }),
      );

    response.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
}