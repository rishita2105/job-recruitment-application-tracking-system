import { ArrowLeft, Save } from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const emptyJob = {
  title: "",
  description: "",
  category: "",
  location: "",
  workMode: "onsite",
  employmentType: "full-time",
  experienceLevel: "fresher",
  requirementsText: "",
  skillsText: "",
  salaryMin: "",
  salaryMax: "",
  currency: "INR",
  applicationDeadline: "",
  status: "draft",
};

export default function RecruiterJobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(jobId);

  const [form, setForm] = useState(emptyJob);

  const [loading, setLoading] = useState(isEditing);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    async function loadJob() {
      try {
        const response = await api.get(`/recruiter/jobs/${jobId}`);

        const job = response.data.job;

        setForm({
          title: job.title || "",
          description: job.description || "",
          category: job.category || "",
          location: job.location || "",
          workMode: job.workMode || "onsite",

          employmentType: job.employmentType || "full-time",

          experienceLevel: job.experienceLevel || "fresher",

          requirementsText: job.requirements?.join("\n") || "",

          skillsText: job.skills?.join(", ") || "",

          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
          currency: job.currency || "INR",

          applicationDeadline: job.applicationDeadline
            ? job.applicationDeadline.slice(0, 10)
            : "",

          status:
            job.status === "closed" || job.status === "expired"
              ? "draft"
              : job.status,
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [isEditing, jobId]);

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

    const requirements = form.requirementsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const skills = form.skillsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const requestBody = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      workMode: form.workMode,
      employmentType: form.employmentType,
      experienceLevel: form.experienceLevel,
      requirements,
      skills,
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      currency: form.currency,
      applicationDeadline: form.applicationDeadline,
      status: form.status,
    };

    try {
      if (isEditing) {
        await api.put(`/recruiter/jobs/${jobId}`, requestBody);
      } else {
        await api.post("/recruiter/jobs", requestBody);
      }

      navigate("/recruiter/jobs", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save job");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p>Loading job...</p>
      </main>
    );
  }

  return (
    <DashboardLayout
      role="Recruiter"
      title={isEditing ? "Edit job" : "Create job"}
      subtitle={
        isEditing
          ? "Update the job information."
          : "Create a new opportunity for candidates."
      }
    >
      <div className="mx-auto max-w-5xl">
        <Link
          to="/recruiter/jobs"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to jobs
        </Link>

        {error && (
          <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Basic information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Input
                label="Job title"
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="Frontend Developer"
                required
              />

              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={updateField}
                placeholder="Software Development"
                required
              />

              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Hyderabad, India"
                required
              />

              <Select
                label="Work mode"
                name="workMode"
                value={form.workMode}
                onChange={updateField}
                options={[
                  ["onsite", "On-site"],
                  ["remote", "Remote"],
                  ["hybrid", "Hybrid"],
                ]}
              />

              <Select
                label="Employment type"
                name="employmentType"
                value={form.employmentType}
                onChange={updateField}
                options={[
                  ["full-time", "Full-time"],
                  ["part-time", "Part-time"],
                  ["internship", "Internship"],
                  ["contract", "Contract"],
                  ["temporary", "Temporary"],
                ]}
              />

              <Select
                label="Experience level"
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={updateField}
                options={[
                  ["fresher", "Fresher"],
                  ["entry-level", "Entry level"],
                  ["mid-level", "Mid level"],
                  ["senior-level", "Senior level"],
                  ["lead", "Lead"],
                ]}
              />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Job description</span>

              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="8"
                required
                maxLength="5000"
                placeholder="Describe the role, responsibilities and ideal candidate..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Requirements and skills</h2>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Requirements</span>

              <textarea
                name="requirementsText"
                value={form.requirementsText}
                onChange={updateField}
                rows="6"
                placeholder={`Bachelor's degree\nGood communication skills\nKnowledge of React`}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <span className="mt-2 block text-xs text-slate-500">
                Enter one requirement per line.
              </span>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Skills</span>

              <input
                name="skillsText"
                value={form.skillsText}
                onChange={updateField}
                placeholder="React, JavaScript, HTML, CSS"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <span className="mt-2 block text-xs text-slate-500">
                Separate skills using commas.
              </span>
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Salary and deadline</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Input
                label="Minimum salary"
                name="salaryMin"
                type="number"
                min="0"
                value={form.salaryMin}
                onChange={updateField}
                placeholder="300000"
              />

              <Input
                label="Maximum salary"
                name="salaryMax"
                type="number"
                min="0"
                value={form.salaryMax}
                onChange={updateField}
                placeholder="600000"
              />

              <Select
                label="Currency"
                name="currency"
                value={form.currency}
                onChange={updateField}
                options={[
                  ["INR", "INR"],
                  ["USD", "USD"],
                  ["EUR", "EUR"],
                  ["GBP", "GBP"],
                ]}
              />

              <Input
                label="Application deadline"
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={updateField}
                required
              />

              <Select
                label="Job status"
                name="status"
                value={form.status}
                onChange={updateField}
                options={[
                  ["draft", "Save as draft"],
                  ["active", "Publish job"],
                ]}
              />
            </div>
          </section>

          <button
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            <Save size={18} />

            {saving ? "Saving..." : isEditing ? "Update job" : "Create job"}
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
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({ label, options, ...properties }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>

      <select
        {...properties}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
