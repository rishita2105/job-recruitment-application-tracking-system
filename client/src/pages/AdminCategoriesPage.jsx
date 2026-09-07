import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const emptyForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/categories");

      setCategories(response.data.categories);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditing(category) {
    setEditingId(category._id);

    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });

    setError("");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId("");
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      let response;

      if (editingId) {
        response = await api.put(`/admin/categories/${editingId}`, form);
      } else {
        response = await api.post("/admin/categories", form);
      }

      setMessage(response.data.message);
      setEditingId("");
      setForm(emptyForm);

      await loadCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Delete the "${category.name}" category?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category._id);
      setError("");
      setMessage("");

      const response = await api.delete(`/admin/categories/${category._id}`);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) => currentCategory._id !== category._id,
        ),
      );

      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete category");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <DashboardLayout
      role="Admin"
      title="Job categories"
      subtitle="Create and manage categories used in job postings."
    >
      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit category" : "Add category"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                aria-label="Cancel editing"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-semibold"
            >
              Category name
            </label>

            <input
              id="category-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Example: Software Development"
              maxLength={60}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="category-description"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="category-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short category description"
              rows={4}
              maxLength={300}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {editingId && (
            <label className="mt-5 flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="size-4"
              />

              <span className="text-sm font-semibold">Category is active</span>
            </label>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            {saving
              ? "Saving..."
              : editingId
                ? "Update category"
                : "Create category"}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-900">All categories</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {loading ? (
              <p className="p-8 text-center text-slate-500">
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className="p-8 text-center text-slate-500">
                No categories created.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-slate-900">
                        {category.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {category.description || "No description"}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {category.jobCount ?? 0} job(s)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(category)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category._id}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />

                      {deletingId === category._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
