import { CalendarDays, MapPin, Phone, Video } from "lucide-react";

import { useEffect, useState } from "react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterviews() {
      try {
        const response = await api.get("/candidate/interviews");

        setInterviews(response.data.interviews);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load interviews",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, []);

  return (
    <DashboardLayout
      role="Candidate"
      title="My interviews"
      subtitle="View your scheduled interviews."
    >
      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>
      )}

      {loading ? (
        <p>Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <CalendarDays size={42} className="mx-auto text-slate-300" />

          <p className="mt-4">You do not have any interviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <article
              key={interview._id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <StatusBadge status={interview.status} />

              <h2 className="mt-3 text-xl font-bold">{interview.job?.title}</h2>

              <p className="mt-1 font-semibold text-slate-600">
                {interview.company?.name}
              </p>

              <p className="mt-4 text-lg font-bold">
                {new Date(interview.scheduledAt).toLocaleString()}
              </p>

              <p className="mt-2 capitalize text-slate-500">
                {interview.interviewType} · {interview.durationMinutes} minutes
              </p>

              {interview.status === "scheduled" && (
                <>
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center gap-2 font-bold text-blue-600"
                    >
                      <Video size={18} />
                      Join online interview
                    </a>
                  )}

                  {interview.location && (
                    <p className="mt-4 flex items-center gap-2">
                      <MapPin size={18} />
                      {interview.location}
                    </p>
                  )}

                  {interview.contactPhone && (
                    <p className="mt-4 flex items-center gap-2">
                      <Phone size={18} />
                      {interview.contactPhone}
                    </p>
                  )}
                </>
              )}

              {interview.notes && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-bold">Instructions</p>

                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                    {interview.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
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
