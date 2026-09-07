import mongoose from "mongoose";

import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import SavedJob from "../models/SavedJob.js";
import Category from "../models/Category.js";

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSlug(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/users
export async function getAllUsers(request, response) {
  try {
    const { search = "", role = "", status = "" } = request.query;

    const filter = {};

    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (role && ["candidate", "recruiter", "admin"].includes(role)) {
      filter.role = role;
    }

    if (["active", "blocked"].includes(status)) {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select("name email role status createdAt updatedAt")
      .sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
}

// PATCH /api/admin/users/:userId/block
export async function toggleUserBlock(request, response) {
  try {
    const { userId } = request.params;

    if (!mongoose.isValidObjectId(userId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (request.user._id.toString() === user._id.toString()) {
      return response.status(400).json({
        success: false,
        message: "You cannot block your own account",
      });
    }

    if (user.role === "admin") {
      return response.status(403).json({
        success: false,
        message: "Admin accounts cannot be blocked",
      });
    }

    user.status = user.status === "blocked" ? "active" : "blocked";

    await user.save();

    return response.status(200).json({
      success: true,
      message:
        user.status === "blocked"
          ? "User blocked successfully"
          : "User unblocked successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Toggle user block error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to update user status",
    });
  }
}

// GET /api/admin/jobs
export async function getAllJobsForAdmin(request, response) {
  try {
    const { search = "", status = "", category = "" } = request.query;

    const filter = {};

    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        {
          title: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          location: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const jobs = await Job.find(filter)
      .populate("company", "name logo")
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load jobs",
    });
  }
}

// DELETE /api/admin/jobs/:jobId
export async function removeJob(request, response) {
  try {
    const { jobId } = request.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return response.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await Promise.all([
      Application.deleteMany({ job: jobId }),
      Interview.deleteMany({ job: jobId }),
      SavedJob.deleteMany({ job: jobId }),
    ]);

    await Job.findByIdAndDelete(jobId);

    return response.status(200).json({
      success: true,
      message: "Job and its related records removed successfully",
    });
  } catch (error) {
    console.error("Remove job error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to remove job",
    });
  }
}

// GET /api/admin/categories
export async function getAllCategoriesForAdmin(request, response) {
  try {
    const categories = await Category.find()
      .populate("createdBy", "name email")
      .sort({ name: 1 });

    const categoriesWithJobCount = await Promise.all(
      categories.map(async (category) => {
        const jobCount = await Job.countDocuments({
          category: category.name,
        });

        return {
          ...category.toObject(),
          jobCount,
        };
      }),
    );

    return response.status(200).json({
      success: true,
      count: categoriesWithJobCount.length,
      categories: categoriesWithJobCount,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load categories",
    });
  }
}

// POST /api/admin/categories
export async function createCategory(request, response) {
  try {
    const { name, description = "" } = request.body;

    if (!name?.trim()) {
      return response.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalizedName = name.trim();
    const slug = createSlug(normalizedName);

    if (!slug) {
      return response.status(400).json({
        success: false,
        message: "Enter a valid category name",
      });
    }

    const existingCategory = await Category.findOne({
      $or: [
        {
          name: {
            $regex: `^${escapeRegex(normalizedName)}$`,
            $options: "i",
          },
        },
        { slug },
      ],
    });

    if (existingCategory) {
      return response.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const category = await Category.create({
      name: normalizedName,
      slug,
      description: description.trim(),
      isActive: true,
      createdBy: request.user._id,
    });

    return response.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    return response.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
}

// PUT /api/admin/categories/:categoryId
export async function updateCategory(request, response) {
  try {
    const { categoryId } = request.params;
    const { name, description, isActive } = request.body;

    if (!mongoose.isValidObjectId(categoryId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return response.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldCategoryName = category.name;

    if (name !== undefined) {
      const normalizedName = name.trim();
      const slug = createSlug(normalizedName);

      if (!normalizedName || !slug) {
        return response.status(400).json({
          success: false,
          message: "Enter a valid category name",
        });
      }

      const duplicateCategory = await Category.findOne({
        _id: {
          $ne: categoryId,
        },

        $or: [
          {
            name: {
              $regex: `^${escapeRegex(normalizedName)}$`,
              $options: "i",
            },
          },
          { slug },
        ],
      });

      if (duplicateCategory) {
        return response.status(409).json({
          success: false,
          message: "A category with this name already exists",
        });
      }

      category.name = normalizedName;
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    if (oldCategoryName !== category.name) {
      await Job.updateMany(
        {
          category: oldCategoryName,
        },
        {
          $set: {
            category: category.name,
          },
        },
      );
    }

    return response.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    return response.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
}

// DELETE /api/admin/categories/:categoryId
export async function deleteCategory(request, response) {
  try {
    const { categoryId } = request.params;

    if (!mongoose.isValidObjectId(categoryId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return response.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const jobCount = await Job.countDocuments({
      category: category.name,
    });

    if (jobCount > 0) {
      return response.status(400).json({
        success: false,
        message: `This category is used by ${jobCount} job(s). Deactivate it instead.`,
      });
    }

    await Category.findByIdAndDelete(categoryId);

    return response.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
}

// GET /api/categories
export async function getActiveCategories(request, response) {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .select("name slug description")
      .sort({ name: 1 });

    return response.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get active categories error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load categories",
    });
  }
}
