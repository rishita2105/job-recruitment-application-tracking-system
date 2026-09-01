import { useEffect, useState } from "react";

import api from "../api/axiosInstance";
import JobCard from "../components/JobCard";
import DashboardLayout from "../layouts/DashboardLayout";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const response = await api.get("/candidate/jobs/saved");

        setSavedJobs(response.data.savedJobs);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load saved jobs",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSavedJobs();
  }, []);

  async function removeSavedJob(jobId) {
    try {
      await api.delete(`/candidate/jobs/${jobId}/save`);

      setSavedJobs((current) =>
        current.filter((item) => item.job._id !== jobId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to remove saved job",
      );
    }
  }

  return (
    <DashboardLayout
      role="Candidate"
      title="Saved jobs"
      subtitle="Jobs you want to review later."
    >
      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>
      )}

      {loading ? (
        <p>Loading saved jobs...</p>
      ) : savedJobs.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center">
          You have not saved any jobs.
        </p>
      ) : (
        <div className="space-y-4">
          {savedJobs.map(({ job }) => (
            <JobCard
              key={job._id}
              job={job}
              action={
                <button
                  onClick={() => removeSavedJob(job._id)}
                  className="font-bold text-rose-600"
                >
                  Remove from saved jobs
                </button>
              }
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
