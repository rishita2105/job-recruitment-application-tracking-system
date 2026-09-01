import { BriefcaseBusiness, Edit3, Plus } from "lucide-react";

import { useEffect, useState } from "react";

import { Link } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/recruiter/jobs", {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });

      setJobs(response.data.jobs);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  async function changeStatus(jobId, status) {
    setMessage("");
    setError("");

    try {
      const response = await api.patch(`/recruiter/jobs/${jobId}/status`, {
        status,
      });

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                status: response.data.job.status,
              }
            : job,
        ),
      );

      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update job status",
      );
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadJobs();
  }

  return (
    <DashboardLayout
      role="Recruiter"
      title="Manage jobs"
      subtitle="Create and manage your job postings."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your jobs..."
              className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

            <button className="rounded-xl bg-slate-200 px-5 py-3 font-bold">
              Search
            </button>
          </form>

          <Link
            to="/recruiter/jobs/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            <Plus size={18} />
            Create job
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["", "All"],
            ["active", "Active"],
            ["draft", "Draft"],
            ["closed", "Closed"],
            ["expired", "Expired"],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                statusFilter === value
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {message && (
          <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BriefcaseBusiness size={42} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-xl font-bold">No jobs found</h2>

            <p className="mt-2 text-slate-500">
              Create your first job posting.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <article
                key={job._id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">{job.title}</h2>

                      <StatusBadge status={job.status} />
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      {job.company?.name}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      {job.location} · {job.workMode} · {job.employmentType}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Deadline:{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Applications: {job.applicationsCount || 0}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <Link
                      to={`/recruiter/jobs/${job._id}/edit`}
                      className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold"
                    >
                      <Edit3 size={16} />
                      Edit
                    </Link>

                    {job.status !== "closed" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(job._id, "closed")}
                        className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeStatus(job._id, "active")}
                        className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                      >
                        Reopen
                      </button>
                    )}

                    {job.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(job._id, "active")}
                        className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700",
    draft: "bg-slate-100 text-slate-700",
    closed: "bg-rose-50 text-rose-700",
    expired: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}
