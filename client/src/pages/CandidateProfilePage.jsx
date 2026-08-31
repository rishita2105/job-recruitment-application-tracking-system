import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const emptyEducation = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
  current: false,
};

const emptyExperience = {
  company: "",
  jobTitle: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

const emptyProfile = {
  phone: "",
  location: "",
  professionalTitle: "",
  summary: "",
  linkedin: "",
  github: "",
  skills: [],
  education: [],
  experience: [],
  resumeUrl: "",
  resumeOriginalName: "",
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [skillsText, setSkillsText] = useState("");
  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/candidate/profile");

        const receivedProfile = response.data.profile || emptyProfile;

        setProfile({
          ...emptyProfile,
          ...receivedProfile,
        });

        setSkillsText(receivedProfile.skills?.join(", ") || "");
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load profile",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function addEducation() {
    setProfile((current) => ({
      ...current,
      education: [...current.education, { ...emptyEducation }],
    }));
  }

  function updateEducation(index, field, value) {
    setProfile((current) => ({
      ...current,

      education: current.education.map((education, educationIndex) =>
        educationIndex === index
          ? {
              ...education,
              [field]: value,
            }
          : education,
      ),
    }));
  }

  function removeEducation(index) {
    setProfile((current) => ({
      ...current,

      education: current.education.filter(
        (_, educationIndex) => educationIndex !== index,
      ),
    }));
  }

  function addExperience() {
    setProfile((current) => ({
      ...current,
      experience: [...current.experience, { ...emptyExperience }],
    }));
  }

  function updateExperience(index, field, value) {
    setProfile((current) => ({
      ...current,

      experience: current.experience.map((experience, experienceIndex) =>
        experienceIndex === index
          ? {
              ...experience,
              [field]: value,
            }
          : experience,
      ),
    }));
  }

  function removeExperience(index) {
    setProfile((current) => ({
      ...current,

      experience: current.experience.filter(
        (_, experienceIndex) => experienceIndex !== index,
      ),
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const skills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      const response = await api.put("/candidate/profile", {
        phone: profile.phone,
        location: profile.location,
        professionalTitle: profile.professionalTitle,
        summary: profile.summary,
        linkedin: profile.linkedin,
        github: profile.github,
        skills,
        education: profile.education,
        experience: profile.experience,
      });

      setProfile((current) => ({
        ...current,
        ...response.data.profile,
      }));

      setMessage("Profile saved successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save profile",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(event) {
    event.preventDefault();

    if (!resume) {
      setError("Please select a PDF resume");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    const formData = new FormData();

    formData.append("resume", resume);

    try {
      const response = await api.post("/candidate/profile/resume", formData);

      setProfile((current) => ({
        ...current,
        resumeUrl: response.data.resumeUrl,
        resumeOriginalName: response.data.resumeOriginalName,
      }));

      setResume(null);
      setMessage("Resume uploaded successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to upload resume",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p>Loading candidate profile...</p>
      </main>
    );
  }

  return (
    <DashboardLayout
      role="Candidate"
      title="Candidate profile"
      subtitle="Add the information recruiters will see."
    >
      <div className="mx-auto max-w-5xl">
        {message && (
          <p className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <form onSubmit={saveProfile} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Personal information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Input
                label="Professional title"
                name="professionalTitle"
                value={profile.professionalTitle}
                onChange={updateField}
                placeholder="Frontend Developer"
              />

              <Input
                label="Phone number"
                name="phone"
                value={profile.phone}
                onChange={updateField}
                placeholder="+91 9876543210"
              />

              <Input
                label="Location"
                name="location"
                value={profile.location}
                onChange={updateField}
                placeholder="Hyderabad, India"
              />

              <Input
                label="LinkedIn URL"
                name="linkedin"
                value={profile.linkedin}
                onChange={updateField}
                placeholder="https://linkedin.com/in/..."
              />

              <Input
                label="GitHub URL"
                name="github"
                value={profile.github}
                onChange={updateField}
                placeholder="https://github.com/..."
              />
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Professional summary
            </label>

            <textarea
              name="summary"
              value={profile.summary}
              onChange={updateField}
              rows="5"
              maxLength="1000"
              placeholder="Write a short professional summary..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mt-5 block text-sm font-semibold">Skills</label>

            <input
              value={skillsText}
              onChange={(event) => setSkillsText(event.target.value)}
              placeholder="React, JavaScript, HTML, CSS"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate skills using commas.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Education</h2>

              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
              >
                <Plus size={17} />
                Add education
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {profile.education.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No education added yet.
                </p>
              )}

              {profile.education.map((education, index) => (
                <div
                  key={education._id || index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Institution"
                      value={education.institution}
                      onChange={(event) =>
                        updateEducation(
                          index,
                          "institution",
                          event.target.value,
                        )
                      }
                    />

                    <Input
                      label="Degree"
                      value={education.degree}
                      onChange={(event) =>
                        updateEducation(index, "degree", event.target.value)
                      }
                    />

                    <Input
                      label="Field of study"
                      value={education.fieldOfStudy}
                      onChange={(event) =>
                        updateEducation(
                          index,
                          "fieldOfStudy",
                          event.target.value,
                        )
                      }
                    />

                    <Input
                      label="Start year"
                      value={education.startYear}
                      onChange={(event) =>
                        updateEducation(index, "startYear", event.target.value)
                      }
                    />

                    <Input
                      label="End year"
                      value={education.endYear}
                      onChange={(event) =>
                        updateEducation(index, "endYear", event.target.value)
                      }
                      disabled={education.current}
                    />
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={education.current}
                      onChange={(event) =>
                        updateEducation(index, "current", event.target.checked)
                      }
                    />
                    Currently studying
                  </label>

                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Experience</h2>

              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
              >
                <Plus size={17} />
                Add experience
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {profile.experience.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No experience added yet.
                </p>
              )}

              {profile.experience.map((experience, index) => (
                <div
                  key={experience._id || index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Company"
                      value={experience.company}
                      onChange={(event) =>
                        updateExperience(index, "company", event.target.value)
                      }
                    />

                    <Input
                      label="Job title"
                      value={experience.jobTitle}
                      onChange={(event) =>
                        updateExperience(index, "jobTitle", event.target.value)
                      }
                    />

                    <Input
                      label="Location"
                      value={experience.location}
                      onChange={(event) =>
                        updateExperience(index, "location", event.target.value)
                      }
                    />

                    <Input
                      label="Start date"
                      type="date"
                      value={experience.startDate}
                      onChange={(event) =>
                        updateExperience(index, "startDate", event.target.value)
                      }
                    />

                    <Input
                      label="End date"
                      type="date"
                      value={experience.endDate}
                      onChange={(event) =>
                        updateExperience(index, "endDate", event.target.value)
                      }
                      disabled={experience.current}
                    />
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={experience.current}
                      onChange={(event) =>
                        updateExperience(index, "current", event.target.checked)
                      }
                    />
                    I currently work here
                  </label>

                  <label className="mt-4 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    value={experience.description}
                    onChange={(event) =>
                      updateExperience(index, "description", event.target.value)
                    }
                    rows="3"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <button
            disabled={saving}
            className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Resume</h2>

          {profile.resumeUrl && (
            <a
              href={`${serverUrl}${profile.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-sm font-bold text-blue-600"
            >
              View {profile.resumeOriginalName || "resume"}
            </a>
          )}

          <form onSubmit={uploadResume} className="mt-5">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => setResume(event.target.files[0])}
              className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"
            />

            <button
              disabled={uploading}
              className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60"
            >
              <Upload size={18} />

              {uploading ? "Uploading..." : "Upload resume"}
            </button>
          </form>
        </section>
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
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
      />
    </label>
  );
}
