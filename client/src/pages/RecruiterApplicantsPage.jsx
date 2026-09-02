import { FileText, UserRound } from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useParams } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const statusOptions = [
  ["", "All applications"],
  ["applied", "Applied"],
  ["under_review", "Under review"],
  ["shortlisted", "Shortlisted"],
  ["interview_scheduled", "Interview scheduled"],
  ["selected", "Selected"],
  ["rejected", "Rejected"],
];

export default function RecruiterApplicantsPage() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);

  const [job, setJob] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      setError("");

      try {
        const endpoint = jobId
          ? `/recruiter/jobs/${jobId}/applications`
          : "/recruiter/applications";

        const response = await api.get(endpoint, {
          params: {
            status: statusFilter || undefined,
          },
        });

        setApplications(response.data.applications);

        setJob(response.data.job || null);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load applications",
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [jobId, statusFilter]);

  return (
    <DashboardLayout
      role="Recruiter"
      title={job ? `${job.title} applicants` : "All applicants"}
      subtitle="Review candidates and manage application status."
    >
      <div className="space-y-6">
        {jobId && (
          <Link
            to="/recruiter/jobs"
            className="inline-block text-sm font-bold text-blue-600"
          >
            ← Back to jobs
          </Link>
        )}

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Total applicants</p>

            <p className="mt-1 text-3xl font-bold">{applications.length}</p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="rounded-2xl bg-white p-8 text-center">
            Loading applicants...
          </p>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <UserRound size={42} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-xl font-bold">No applicants found</h2>

            <p className="mt-2 text-slate-500">
              Applications will appear here when candidates apply.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <article
                key={application._id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-full bg-slate-100 font-bold">
                        {getInitials(application.candidate?.name)}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">
                          {application.candidate?.name}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {application.candidate?.email}
                        </p>
                      </div>
                    </div>

                    {!jobId && (
                      <p className="mt-4 text-sm">
                        Applied for:{" "}
                        <span className="font-bold">
                          {application.job?.title}
                        </span>
                      </p>
                    )}

                    {application.candidateProfile?.professionalTitle && (
                      <p className="mt-2 text-sm text-slate-600">
                        {application.candidateProfile.professionalTitle}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                      Applied on{" "}
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <StatusBadge status={application.status} />

                    <Link
                      to={`/recruiter/applications/${application._id}`}
                      className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                    >
                      <FileText size={16} />
                      Review Application
                    </Link>
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

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C"
  );
}

function StatusBadge({ status }) {
  const styles = {
    applied: "bg-blue-50 text-blue-700",

    under_review: "bg-amber-50 text-amber-700",

    shortlisted: "bg-violet-50 text-violet-700",

    interview_scheduled: "bg-cyan-50 text-cyan-700",

    selected: "bg-emerald-50 text-emerald-700",

    rejected: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.applied
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
