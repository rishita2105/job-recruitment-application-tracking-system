import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  MapPin,
  Video,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  async function loadInterviews() {
    setLoading(true);

    try {
      const response = await api.get("/recruiter/interviews", {
        params: {
          status: statusFilter || undefined,
        },
      });

      setInterviews(response.data.interviews);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load interviews",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterviews();
  }, [statusFilter]);

  async function updateStatus(interviewId, action) {
    setMessage("");
    setError("");

    try {
      const response = await api.patch(
        `/recruiter/interviews/${interviewId}/${action}`,
      );

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? {
                ...interview,
                status: response.data.interview.status,
              }
            : interview,
        ),
      );

      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update interview",
      );
    }
  }

  return (
    <DashboardLayout
      role="Recruiter"
      title="Interviews"
      subtitle="Manage scheduled candidate interviews."
    >
      <div className="space-y-6">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
        >
          <option value="">All interviews</option>

          <option value="scheduled">Scheduled</option>

          <option value="completed">Completed</option>

          <option value="cancelled">Cancelled</option>
        </select>

        {message && (
          <p className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>
        )}

        {loading ? (
          <p>Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <CalendarDays size={42} className="mx-auto text-slate-300" />

            <p className="mt-4">No interviews found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <article
                key={interview._id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div>
                    <StatusBadge status={interview.status} />

                    <h2 className="mt-3 text-xl font-bold">
                      {interview.candidate?.name}
                    </h2>

                    <p className="mt-1 font-semibold text-slate-600">
                      {interview.job?.title}
                    </p>

                    <p className="mt-4 font-bold">
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm capitalize text-slate-500">
                      {interview.interviewType} interview ·{" "}
                      {interview.durationMinutes} minutes
                    </p>

                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 flex items-center gap-2 font-bold text-blue-600"
                      >
                        <Video size={17} />
                        Open meeting link
                      </a>
                    )}

                    {interview.location && (
                      <p className="mt-3 flex items-center gap-2">
                        <MapPin size={17} />
                        {interview.location}
                      </p>
                    )}

                    {interview.contactPhone && (
                      <p className="mt-3">Phone: {interview.contactPhone}</p>
                    )}
                  </div>

                  {interview.status === "scheduled" && (
                    <div className="flex flex-wrap items-start gap-2">
                      <Link
                        to={`/recruiter/interviews/${interview._id}/edit`}
                        className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-700"
                      >
                        <Edit3 size={16} />
                        Reschedule
                      </Link>

                      <button
                        onClick={() => updateStatus(interview._id, "complete")}
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 font-bold text-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>

                      <button
                        onClick={() => updateStatus(interview._id, "cancel")}
                        className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 font-bold text-rose-700"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
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
    scheduled: "bg-blue-50 text-blue-700",

    completed: "bg-emerald-50 text-emerald-700",

    cancelled: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
}
