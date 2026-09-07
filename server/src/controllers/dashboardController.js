import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";

// Candidate dashboard
// GET /api/dashboard/candidate
export async function getCandidateDashboard(request, response) {
  try {
    const candidateId = request.user._id;

    const [
      totalApplications,
      underReview,
      shortlisted,
      selected,
      rejected,
      interviewCount,
      recentApplications,
      upcomingInterviews,
    ] = await Promise.all([
      Application.countDocuments({
        candidate: candidateId,
      }),

      Application.countDocuments({
        candidate: candidateId,
        status: "under_review",
      }),

      Application.countDocuments({
        candidate: candidateId,
        status: "shortlisted",
      }),

      Application.countDocuments({
        candidate: candidateId,
        status: "selected",
      }),

      Application.countDocuments({
        candidate: candidateId,
        status: "rejected",
      }),

      Interview.countDocuments({
        candidate: candidateId,
        status: { $ne: "cancelled" },
      }),

      Application.find({
        candidate: candidateId,
      })
        .populate({
          path: "job",
          select: "title location employmentType company",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .sort({ createdAt: -1 })
        .limit(5),

      Interview.find({
        candidate: candidateId,
        status: "scheduled",
        scheduledAt: { $gte: new Date() },
      })
        .populate("job", "title location")
        .populate("company", "name logo")
        .sort({ scheduledAt: 1 })
        .limit(5),
    ]);

    return response.status(200).json({
      success: true,

      stats: {
        totalApplications,
        underReview,
        shortlisted,
        interviews: interviewCount,
        selected,
        rejected,
      },

      recentApplications,
      upcomingInterviews,
    });
  } catch (error) {
    console.error("Candidate dashboard error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load candidate dashboard",
    });
  }
}

// Recruiter dashboard
// GET /api/dashboard/recruiter
export async function getRecruiterDashboard(request, response) {
  try {
    const recruiterId = request.user._id;

    const recruiterJobs = await Job.find({
      recruiter: recruiterId,
    }).select("_id");

    const jobIds = recruiterJobs.map((job) => job._id);

    const [
      activeJobs,
      totalApplicants,
      applicationsUnderReview,
      shortlistedCandidates,
      selectedCandidates,
      scheduledInterviews,
      recentApplications,
      upcomingInterviews,
    ] = await Promise.all([
      Job.countDocuments({
        recruiter: recruiterId,
        status: "active",
      }),

      Application.countDocuments({
        job: { $in: jobIds },
      }),

      Application.countDocuments({
        job: { $in: jobIds },
        status: "under_review",
      }),

      Application.countDocuments({
        job: { $in: jobIds },
        status: "shortlisted",
      }),

      Application.countDocuments({
        job: { $in: jobIds },
        status: "selected",
      }),

      Interview.countDocuments({
        recruiter: recruiterId,
        status: "scheduled",
        scheduledAt: { $gte: new Date() },
      }),

      Application.find({
        job: { $in: jobIds },
      })
        .populate("candidate", "name email")
        .populate("job", "title location")
        .sort({ createdAt: -1 })
        .limit(5),

      Interview.find({
        recruiter: recruiterId,
        status: "scheduled",
        scheduledAt: { $gte: new Date() },
      })
        .populate("candidate", "name email")
        .populate("job", "title location")
        .sort({ scheduledAt: 1 })
        .limit(5),
    ]);

    return response.status(200).json({
      success: true,

      stats: {
        activeJobs,
        totalApplicants,
        applicationsUnderReview,
        shortlistedCandidates,
        scheduledInterviews,
        selectedCandidates,
      },

      recentApplications,
      upcomingInterviews,
    });
  } catch (error) {
    console.error("Recruiter dashboard error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load recruiter dashboard",
    });
  }
}

// Admin dashboard
// GET /api/dashboard/admin
export async function getAdminDashboard(request, response) {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalAdmins,
      totalCompanies,
      activeJobs,
      totalApplications,
      interviewsScheduled,
      successfulHires,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "candidate",
      }),

      User.countDocuments({
        role: "recruiter",
      }),

      User.countDocuments({
        role: "admin",
      }),

      Company.countDocuments(),

      Job.countDocuments({
        status: "active",
      }),

      Application.countDocuments(),

      Interview.countDocuments({
        status: "scheduled",
        scheduledAt: { $gte: new Date() },
      }),

      Application.countDocuments({
        status: "selected",
      }),

      User.find()
        .select("name email role status createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Job.find()
        .select("title status location company recruiter createdAt")
        .populate("company", "name")
        .populate("recruiter", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return response.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalCompanies,
        activeJobs,
        totalApplications,
        interviewsScheduled,
        successfulHires,
      },

      recentUsers,
      recentJobs,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load admin dashboard",
    });
  }
}
