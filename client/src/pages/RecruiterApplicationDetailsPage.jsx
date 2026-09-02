import { BriefcaseBusiness, Download, Mail, MapPin, Phone } from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useParams } from "react-router";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const statusButtons = [
  {
    value: "under_review",
    label: "Under Review",
    style: "bg-amber-50 text-amber-700",
  },
  {
    value: "shortlisted",
    label: "Shortlist",
    style: "bg-violet-50 text-violet-700",
  },
  {
    value: "selected",
    label: "Select",
    style: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "rejected",
    label: "Reject",
    style: "bg-rose-50 text-rose-700",
  },
];

export default function RecruiterApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);

  const [candidateProfile, setCandidateProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const serverUrl = (
    import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  useEffect(() => {
    async function loadApplication() {
      try {
        const response = await api.get(
          `/recruiter/applications/${applicationId}`,
        );

        setApplication(response.data.application);

        setCandidateProfile(response.data.candidateProfile);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load application",
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId]);

  async function changeStatus(status) {
    setUpdating(true);
    setMessage("");
    setError("");

    try {
      const response = await api.patch(
        `/recruiter/applications/${applicationId}/status`,
        {
          status,
        },
      );

      setApplication((current) => ({
        ...current,
        status: response.data.application.status,
        statusHistory: response.data.application.statusHistory,
      }));

      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update status",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        Loading application...
      </main>
    );
  }

  if (!application) {
    return (
      <main className="grid min-h-screen place-items-center">
        {error || "Application not found"}
      </main>
    );
  }

  const candidate = application.candidate;
  const job = application.job;

  return (
    <DashboardLayout
      role="Recruiter"
      title="Review application"
      subtitle={`Application for ${job?.title}`}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          to="/recruiter/applications"
          className="text-sm font-bold text-blue-600"
        >
          ← Back to applicants
        </Link>

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

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row">
            <div>
              <p className="text-sm text-slate-500">Current status</p>

              <StatusBadge status={application.status} />

              <h1 className="mt-5 text-3xl font-bold">{candidate?.name}</h1>

              <p className="mt-2 flex items-center gap-2 text-slate-600">
                <Mail size={17} />
                {candidate?.email}
              </p>

              {candidateProfile?.phone && (
                <p className="mt-2 flex items-center gap-2 text-slate-600">
                  <Phone size={17} />
                  {candidateProfile.phone}
                </p>
              )}

              {candidateProfile?.location && (
                <p className="mt-2 flex items-center gap-2 text-slate-600">
                  <MapPin size={17} />
                  {candidateProfile.location}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-500">Applied for</p>

              <p className="mt-2 flex items-center gap-2 font-bold">
                <BriefcaseBusiness size={18} />
                {job?.title}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Applied on{" "}
                {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {statusButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                disabled={updating || application.status === button.value}
                onClick={() => changeStatus(button.value)}
                className={`rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${button.style}`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Resume</h2>

          {application.resumeUrl ? (
            <a
              href={`${serverUrl}${application.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              <Download size={18} />
              View Resume
            </a>
          ) : (
            <p className="mt-3 text-slate-500">Resume unavailable</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Candidate profile</h2>

          <h3 className="mt-5 font-bold">Professional title</h3>

          <p className="mt-2 text-slate-600">
            {candidateProfile?.professionalTitle || "Not provided"}
          </p>

          <h3 className="mt-5 font-bold">Summary</h3>

          <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
            {candidateProfile?.summary || "Not provided"}
          </p>

          <h3 className="mt-5 font-bold">Skills</h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {candidateProfile?.skills?.length ? (
              candidateProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-500">No skills provided</p>
            )}
          </div>
        </section>

        <ProfileList
          title="Education"
          items={candidateProfile?.education}
          renderItem={(education) => (
            <>
              <h3 className="font-bold">{education.degree}</h3>

              <p className="mt-1 text-slate-600">{education.institution}</p>

              <p className="mt-1 text-sm text-slate-500">
                {education.fieldOfStudy}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {education.startYear} –{" "}
                {education.current ? "Present" : education.endYear}
              </p>
            </>
          )}
        />

        <ProfileList
          title="Experience"
          items={candidateProfile?.experience}
          renderItem={(experience) => (
            <>
              <h3 className="font-bold">{experience.jobTitle}</h3>

              <p className="mt-1 text-slate-600">{experience.company}</p>

              <p className="mt-1 text-sm text-slate-500">
                {experience.startDate} –{" "}
                {experience.current ? "Present" : experience.endDate}
              </p>

              {experience.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {experience.description}
                </p>
              )}
            </>
          )}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Cover letter</h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
            {application.coverLetter ||
              "The candidate did not include a cover letter."}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Status history</h2>

          <div className="mt-4 space-y-3">
            {application.statusHistory?.map((history, index) => (
              <div
                key={`${history.status}-${index}`}
                className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"
              >
                <span className="font-semibold capitalize">
                  {history.status.replaceAll("_", " ")}
                </span>

                <span className="text-slate-500">
                  {new Date(history.changedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function ProfileList({ title, items = [], renderItem }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold">{title}</h2>

      {!items?.length ? (
        <p className="mt-4 text-slate-500">No information provided</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item, index) => (
            <article
              key={item._id || index}
              className="rounded-xl border border-slate-200 p-4"
            >
              {renderItem(item)}
            </article>
          ))}
        </div>
      )}
    </section>
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
      className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-bold capitalize ${
        styles[status] || styles.applied
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
