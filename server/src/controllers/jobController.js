import mongoose from "mongoose";

import Company from "../models/Company.js";
import Job from "../models/Job.js";

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function createJobData(body) {
  const salaryMin =
    body.salaryMin === "" ||
    body.salaryMin === null ||
    body.salaryMin === undefined
      ? null
      : Number(body.salaryMin);

  const salaryMax =
    body.salaryMax === "" ||
    body.salaryMax === null ||
    body.salaryMax === undefined
      ? null
      : Number(body.salaryMax);

  return {
    title: body.title?.trim(),
    description: body.description?.trim(),
    category: body.category?.trim(),
    location: body.location?.trim(),
    workMode: body.workMode,
    employmentType: body.employmentType,
    experienceLevel: body.experienceLevel,

    requirements: normalizeStringArray(
      body.requirements,
    ),

    skills: normalizeStringArray(body.skills),

    salaryMin,
    salaryMax,

    currency: body.currency?.trim() || "INR",

    applicationDeadline:
      body.applicationDeadline,

    status: body.status || "draft",
  };
}

function validateJobData(jobData) {
  if (
    !jobData.title ||
    !jobData.description ||
    !jobData.category ||
    !jobData.location ||
    !jobData.workMode ||
    !jobData.employmentType ||
    !jobData.experienceLevel ||
    !jobData.applicationDeadline
  ) {
    return "Please complete all required fields";
  }

  if (
    !["draft", "active"].includes(jobData.status)
  ) {
    return "A new job can only be draft or active";
  }

  const deadline = new Date(
    jobData.applicationDeadline,
  );

  if (Number.isNaN(deadline.getTime())) {
    return "Enter a valid application deadline";
  }

  if (
    jobData.status === "active" &&
    deadline <= new Date()
  ) {
    return "An active job must have a future deadline";
  }

  if (
    jobData.salaryMin !== null &&
    jobData.salaryMax !== null &&
    jobData.salaryMax < jobData.salaryMin
  ) {
    return "Maximum salary cannot be less than minimum salary";
  }

  return null;
}

export async function createJob(
  request,
  response,
  next,
) {
  try {
    const company = await Company.findOne({
      recruiter: request.user._id,
    });

    if (!company) {
      return response.status(400).json({
        success: false,
        message:
          "Create your company profile before posting a job",
      });
    }

    const jobData = createJobData(request.body);
    const validationError =
      validateJobData(jobData);

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const job = await Job.create({
      ...jobData,
      recruiter: request.user._id,
      company: company._id,
    });

    const populatedJob = await Job.findById(
      job._id,
    )
      .populate(
        "company",
        "name logoUrl industry location status",
      )
      .populate("recruiter", "name email");

    response.status(201).json({
      success: true,
      message:
        job.status === "active"
          ? "Job published successfully"
          : "Job saved as draft",
      job: populatedJob,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterJobs(
  request,
  response,
  next,
) {
  try {
    const { status, search } = request.query;

    const filter = {
      recruiter: request.user._id,
    };

    if (
      status &&
      [
        "draft",
        "active",
        "closed",
        "expired",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (search?.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const jobs = await Job.find(filter)
      .populate(
        "company",
        "name logoUrl industry location status",
      )
      .sort({
        createdAt: -1,
      });

    response.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterJob(
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

    const job = await Job.findOne({
      _id: jobId,
      recruiter: request.user._id,
    }).populate(
      "company",
      "name logoUrl industry location status",
    );

    if (!job) {
      return response.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    response.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(
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

    const existingJob = await Job.findOne({
      _id: jobId,
      recruiter: request.user._id,
    });

    if (!existingJob) {
      return response.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobData = createJobData(request.body);
    const validationError =
      validateJobData(jobData);

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: jobId,
        recruiter: request.user._id,
      },
      {
        $set: jobData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate(
      "company",
      "name logoUrl industry location status",
    );

    response.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateJobStatus(
  request,
  response,
  next,
) {
  try {
    const { jobId } = request.params;
    const { status } = request.body;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    if (
      !["draft", "active", "closed"].includes(
        status,
      )
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid job status",
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      recruiter: request.user._id,
    });

    if (!job) {
      return response.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      status === "active" &&
      new Date(job.applicationDeadline) <=
        new Date()
    ) {
      return response.status(400).json({
        success: false,
        message:
          "Update the application deadline before reopening this job",
      });
    }

    job.status = status;

    await job.save();

    response.status(200).json({
      success: true,
      message:
        status === "closed"
          ? "Job closed successfully"
          : status === "active"
            ? "Job activated successfully"
            : "Job moved to draft",
      job,
    });
  } catch (error) {
    next(error);
  }
}