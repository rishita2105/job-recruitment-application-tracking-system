import CandidateProfile from "../models/CandidateProfile";

function createEmptyProfile(userId) {
  return CandidateProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $setOnInsert: {
        user: userId,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  ).populate("user", "name email role status");
}

export async function getCandidateProfile(
  request,
  response,
  next,
) {
  try {
    const profile = await createEmptyProfile(
      request.user._id,
    );

    response.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCandidateProfile(
  request,
  response,
  next,
) {
  try {
    const {
      phone,
      location,
      professionalTitle,
      summary,
      linkedin,
      github,
      skills,
      education,
      experience,
    } = request.body;

    const profile = await CandidateProfile.findOneAndUpdate(
      {
        user: request.user._id,
      },
      {
        $set: {
          phone: phone || "",
          location: location || "",
          professionalTitle: professionalTitle || "",
          summary: summary || "",
          linkedin: linkedin || "",
          github: github || "",

          skills: Array.isArray(skills)
            ? skills
                .map((skill) => skill.trim())
                .filter(Boolean)
            : [],

          education: Array.isArray(education)
            ? education
            : [],

          experience: Array.isArray(experience)
            ? experience
            : [],
        },

        $setOnInsert: {
          user: request.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).populate("user", "name email role status");

    response.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadCandidateResume(
  request,
  response,
  next,
) {
  try {
    if (!request.file) {
      return response.status(400).json({
        success: false,
        message: "Please select a PDF resume",
      });
    }

    const resumeUrl = `/uploads/resumes/${request.file.filename}`;

    const profile = await CandidateProfile.findOneAndUpdate(
      {
        user: request.user._id,
      },
      {
        $set: {
          resumeUrl,
          resumeOriginalName: request.file.originalname,
        },

        $setOnInsert: {
          user: request.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    response.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: profile.resumeUrl,
      resumeOriginalName: profile.resumeOriginalName,
    });
  } catch (error) {
    next(error);
  }
}