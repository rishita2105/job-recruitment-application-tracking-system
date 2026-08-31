import Company from "../models/Company.js";

export async function getMyCompany(
  request,
  response,
  next,
) {
  try {
    const company = await Company.findOne({
      recruiter: request.user._id,
    }).populate("recruiter", "name email role");

    response.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveMyCompany(
  request,
  response,
  next,
) {
  try {
    const {
      name,
      description,
      industry,
      location,
      website,
      email,
      phone,
      companySize,
      foundedYear,
    } = request.body;

    if (!name?.trim()) {
      return response.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const companyData = {
      name: name.trim(),
      description: description?.trim() || "",
      industry: industry?.trim() || "",
      location: location?.trim() || "",
      website: website?.trim() || "",
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      companySize: companySize || "",

      foundedYear: foundedYear
        ? Number(foundedYear)
        : null,
    };

    const company = await Company.findOneAndUpdate(
      {
        recruiter: request.user._id,
      },
      {
        $set: companyData,

        $setOnInsert: {
          recruiter: request.user._id,
          status: "pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).populate("recruiter", "name email role");

    response.status(200).json({
      success: true,
      message: "Company profile saved successfully",
      company,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadMyCompanyLogo(
  request,
  response,
  next,
) {
  try {
    if (!request.file) {
      return response.status(400).json({
        success: false,
        message: "Please select a company logo",
      });
    }

    const company = await Company.findOne({
      recruiter: request.user._id,
    });

    if (!company) {
      return response.status(400).json({
        success: false,
        message:
          "Save the company profile before uploading a logo",
      });
    }

    company.logoUrl =
      `/uploads/company-logos/${request.file.filename}`;

    await company.save();

    response.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      logoUrl: company.logoUrl,
    });
  } catch (error) {
    next(error);
  }
}