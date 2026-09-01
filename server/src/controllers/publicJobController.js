import mongoose from "mongoose";
import Job from "../models/Job.js";

export async function getPublicJobs(
  request,
  response,
  next,
) {
  try {
    const {
      search,
      location,
      category,
      workMode,
      employmentType,
      experienceLevel,
      page = 1,
      limit = 10,
    } = request.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1,
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      50,
    );

    const filter = {
      status: "active",

      applicationDeadline: {
        $gte: new Date(),
      },
    };

    if (search?.trim()) {
      const expression = new RegExp(
        search.trim(),
        "i",
      );

      filter.$or = [
        {
          title: expression,
        },
        {
          description: expression,
        },
        {
          skills: expression,
        },
      ];
    }

    if (location?.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    if (category?.trim()) {
      filter.category = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    if (workMode) {
      filter.workMode = workMode;
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    const totalJobs =
      await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate(
        "company",
        "name logoUrl industry location website",
      )
      .sort({
        createdAt: -1,
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    response.status(200).json({
      success: true,
      jobs,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalJobs,
        totalPages: Math.ceil(
          totalJobs / limitNumber,
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicJob(
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
      status: "active",

      applicationDeadline: {
        $gte: new Date(),
      },
    })
      .populate(
        "company",
        "name logoUrl description industry location website companySize",
      )
      .populate("recruiter", "name");

    if (!job) {
      return response.status(404).json({
        success: false,
        message:
          "This job is unavailable, closed or expired",
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