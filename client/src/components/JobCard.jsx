import { BriefcaseBusiness, MapPin } from "lucide-react";

import { Link } from "react-router";

export default function JobCard({ job, action }) {
  const serverUrl = (
    import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  const logoUrl = job.company?.logoUrl
    ? `${serverUrl}${job.company.logoUrl}`
    : "";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={job.company?.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <BriefcaseBusiness size={24} className="text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            to={`/jobs/${job._id}`}
            className="text-xl font-bold hover:text-blue-600"
          >
            {job.title}
          </Link>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {job.company?.name}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={15} />
              {job.location}
            </span>

            <span>•</span>
            <span className="capitalize">{job.workMode}</span>

            <span>•</span>
            <span className="capitalize">{job.employmentType}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills?.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Apply before{" "}
            {new Date(job.applicationDeadline).toLocaleDateString()}
          </p>
        </div>
      </div>

      {action && (
        <div className="mt-5 border-t border-slate-100 pt-4">{action}</div>
      )}
    </article>
  );
}
