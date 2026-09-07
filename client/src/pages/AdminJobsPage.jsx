import { useEffect, useState } from "react";
import { ExternalLink, Search, Trash2 } from "lucide-react";
import { Link } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.categories);
      } catch (error) {
        console.error("Unable to load categories:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/jobs", {
          params: {
            search,
            status,
            category,
          },
        });

        setJobs(response.data.jobs);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load jobs");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, status, category]);

  async function handleDelete(job) {
    const confirmed = window.confirm(
      `Permanently remove "${job.title}"? Its applications, interviews and saved-job records will also be removed.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingJobId(job._id);
      setError("");
      setMessage("");

      const response = await api.delete(`/admin/jobs/${job._id}`);

      setJobs((currentJobs) =>
        currentJobs.filter((currentJob) => currentJob._id !== job._id),
      );

      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to remove job");
    } finally {
      setDeletingJobId("");
    }
  }

  return (
    <DashboardLayout
      role="Admin"
      title="Job management"
      subtitle="View and remove jobs published on the platform."
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

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs or locations"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All categories</option>

          {categories.map((categoryItem) => (
            <option key={categoryItem._id} value={categoryItem.name}>
              {categoryItem.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {job.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        job.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-600">
                    {job.company?.name || "Company unavailable"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span>{job.location || "Location unavailable"}</span>

                    <span>{job.category || "Uncategorized"}</span>

                    <span>
                      Recruiter: {job.recruiter?.name || "Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink size={17} />
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    disabled={deletingJobId === job._id}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={17} />

                    {deletingJobId === job._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
