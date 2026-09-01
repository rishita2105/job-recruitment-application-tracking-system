import { useEffect, useState } from "react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await api.get("/candidate/jobs/applications");

        setApplications(response.data.applications);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load applications",
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  return (
    <DashboardLayout
      role="Candidate"
      title="My applications"
      subtitle="Track your application progress."
    >
      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>
      )}

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center">
          You have not applied for any jobs.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <article
              key={application._id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-xl font-bold">
                    {application.job?.title || "Unavailable job"}
                  </h2>

                  <p className="mt-1 font-semibold text-slate-600">
                    {application.job?.company?.name}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    Applied on{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <StatusBadge status={application.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
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
      className={`h-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${
        styles[status] || styles.applied
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
