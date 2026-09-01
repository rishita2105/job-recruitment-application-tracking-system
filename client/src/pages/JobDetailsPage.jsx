import { Bookmark, BookmarkCheck, BriefcaseBusiness } from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  const [applicationStatus, setApplicationStatus] = useState(null);

  const [coverLetter, setCoverLetter] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const serverUrl = (
    import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  useEffect(() => {
    async function loadJob() {
      try {
        const jobResponse = await api.get(`/jobs/${jobId}`);

        setJob(jobResponse.data.job);

        if (user?.role === "candidate") {
          const statusResponse = await api.get(
            `/candidate/jobs/${jobId}/status`,
          );

          setSaved(statusResponse.data.saved);
          setApplied(statusResponse.data.applied);

          setApplicationStatus(statusResponse.data.applicationStatus);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId, user]);

  async function toggleSave() {
    setError("");
    setMessage("");

    try {
      if (saved) {
        await api.delete(`/candidate/jobs/${jobId}/save`);

        setSaved(false);
        setMessage("Job removed from saved jobs");
      } else {
        await api.post(`/candidate/jobs/${jobId}/save`);

        setSaved(true);
        setMessage("Job saved successfully");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update saved job",
      );
    }
  }

  async function applyForJob() {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(`/candidate/jobs/${jobId}/apply`, {
        coverLetter,
      });

      setApplied(true);
      setSaved(false);
      setApplicationStatus("applied");
      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        Loading job...
      </main>
    );
  }

  if (!job) {
    return (
      <main className="grid min-h-screen place-items-center">
        {error || "Job not found"}
      </main>
    );
  }

  const logoUrl = job.company?.logoUrl
    ? `${serverUrl}${job.company.logoUrl}`
    : "";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/jobs" className="font-bold text-blue-600">
          ← Back to jobs
        </Link>

        {message && (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-700">
            {message}
          </p>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700">
            <p>{error}</p>

            {error.toLowerCase().includes("resume") && (
              <Link
                to="/candidate/profile"
                className="mt-2 inline-block font-bold underline"
              >
                Go to candidate profile
              </Link>
            )}
          </div>
        )}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7">
          <div className="flex items-start gap-4">
            <div className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-slate-100">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={job.company?.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BriefcaseBusiness />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>

              <p className="mt-2 font-semibold text-slate-600">
                {job.company?.name}
              </p>

              <p className="mt-2 capitalize text-slate-500">
                {job.location} · {job.workMode} · {job.employmentType}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {!user && (
              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                Log in to apply
              </Link>
            )}

            {user?.role === "candidate" && (
              <>
                <button
                  onClick={toggleSave}
                  disabled={applied}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold disabled:opacity-50"
                >
                  {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}

                  {saved ? "Saved" : "Save job"}
                </button>

                {applied && (
                  <span className="rounded-xl bg-emerald-50 px-5 py-3 font-bold capitalize text-emerald-700">
                    Applied · {applicationStatus?.replace("_", " ")}
                  </span>
                )}
              </>
            )}
          </div>

          <JobSection title="Job description" text={job.description} />

          <JobList title="Requirements" items={job.requirements} />

          <JobList title="Required skills" items={job.skills} />

          <JobSection
            title="Experience level"
            text={job.experienceLevel?.replace("-", " ")}
          />

          <JobSection
            title="Application deadline"
            text={new Date(job.applicationDeadline).toLocaleDateString()}
          />

          {(job.salaryMin || job.salaryMax) && (
            <JobSection
              title="Salary"
              text={`${job.currency} ${job.salaryMin || "Not specified"} – ${
                job.salaryMax || "Not specified"
              }`}
            />
          )}
        </section>

        {user?.role === "candidate" && !applied && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7">
            <h2 className="text-xl font-bold">Apply for this job</h2>

            <p className="mt-2 text-sm text-slate-500">
              Your uploaded candidate-profile resume will be attached.
            </p>

            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              rows="7"
              maxLength="2000"
              placeholder="Optional cover letter..."
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={applyForJob}
              disabled={submitting}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function JobSection({ title, text }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold">{title}</h2>

      <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
        {text}
      </p>
    </section>
  );
}

function JobList({ title, items = [] }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-2 text-slate-500">Not specified</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
