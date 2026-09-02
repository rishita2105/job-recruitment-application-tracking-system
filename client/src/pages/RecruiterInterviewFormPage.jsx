import { CalendarDays, Save } from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const emptyForm = {
  scheduledAt: "",
  durationMinutes: "60",
  interviewType: "online",
  meetingLink: "",
  location: "",
  contactPhone: "",
  notes: "",
};

function convertToLocalInput(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function RecruiterInterviewFormPage() {
  const { applicationId, interviewId } = useParams();

  const navigate = useNavigate();

  const isEditing = Boolean(interviewId);

  const [form, setForm] = useState(emptyForm);

  const [candidateName, setCandidateName] = useState("");

  const [jobTitle, setJobTitle] = useState("");

  const [loading, setLoading] = useState(isEditing);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    async function loadInterview() {
      try {
        const response = await api.get(`/recruiter/interviews/${interviewId}`);

        const interview = response.data.interview;

        setCandidateName(interview.candidate?.name || "");

        setJobTitle(interview.job?.title || "");

        setForm({
          scheduledAt: convertToLocalInput(interview.scheduledAt),

          durationMinutes: String(interview.durationMinutes || 60),

          interviewType: interview.interviewType || "online",

          meetingLink: interview.meetingLink || "",

          location: interview.location || "",

          contactPhone: interview.contactPhone || "",

          notes: interview.notes || "",
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load interview",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [isEditing, interviewId]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const requestBody = {
      scheduledAt: new Date(form.scheduledAt).toISOString(),

      durationMinutes: Number(form.durationMinutes),

      interviewType: form.interviewType,

      meetingLink: form.meetingLink,

      location: form.location,

      contactPhone: form.contactPhone,

      notes: form.notes,
    };

    try {
      if (isEditing) {
        await api.put(`/recruiter/interviews/${interviewId}`, requestBody);
      } else {
        await api.post(
          `/recruiter/applications/${applicationId}/interview`,
          requestBody,
        );
      }

      navigate("/recruiter/interviews", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save interview",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        Loading interview...
      </main>
    );
  }

  return (
    <DashboardLayout
      role="Recruiter"
      title={isEditing ? "Reschedule interview" : "Schedule interview"}
      subtitle={
        candidateName
          ? `${candidateName} · ${jobTitle}`
          : "Choose the interview details."
      }
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/recruiter/interviews"
          className="text-sm font-bold text-blue-600"
        >
          ← Back to interviews
        </Link>

        {error && (
          <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Interview date and time"
              name="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={updateField}
              required
            />

            <Input
              label="Duration in minutes"
              name="durationMinutes"
              type="number"
              min="15"
              max="480"
              value={form.durationMinutes}
              onChange={updateField}
              required
            />

            <label className="block">
              <span className="text-sm font-semibold">Interview type</span>

              <select
                name="interviewType"
                value={form.interviewType}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="online">Online</option>

                <option value="offline">Offline</option>

                <option value="phone">Phone</option>
              </select>
            </label>

            {form.interviewType === "online" && (
              <Input
                label="Meeting link"
                name="meetingLink"
                type="url"
                value={form.meetingLink}
                onChange={updateField}
                placeholder="https://meet.google.com/..."
                required
              />
            )}

            {form.interviewType === "offline" && (
              <Input
                label="Interview location"
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Office address"
                required
              />
            )}

            {form.interviewType === "phone" && (
              <Input
                label="Contact phone"
                name="contactPhone"
                value={form.contactPhone}
                onChange={updateField}
                placeholder="+91 9876543210"
                required
              />
            )}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold">Instructions or notes</span>

            <textarea
              name="notes"
              value={form.notes}
              onChange={updateField}
              rows="6"
              maxLength="2000"
              placeholder="Bring identification, prepare for technical discussion..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </label>

          <button
            disabled={saving}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {isEditing ? <CalendarDays size={18} /> : <Save size={18} />}

            {saving
              ? "Saving..."
              : isEditing
                ? "Reschedule interview"
                : "Schedule interview"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, type = "text", ...properties }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>

      <input
        type={type}
        {...properties}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </label>
  );
}
