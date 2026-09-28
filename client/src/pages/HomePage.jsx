import { BriefcaseBusiness, Building2, UserRound } from "lucide-react";

import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    name: "Candidate",
    text: "Search jobs and track every application.",
    path: "/register?role=candidate",
    icon: UserRound,
    color: "bg-blue-600",
  },
  {
    name: "Recruiter",
    text: "Post jobs and manage your hiring pipeline.",
    path: "/register?role=recruiter",
    icon: Building2,
    color: "bg-violet-600",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  const dashboardPath = user ? `/${user.role}/dashboard` : "/login";

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600">
              <BriefcaseBusiness size={20} />
            </span>
            HireFlow
          </Link>

          <div className="flex items-center gap-3">
            {!user && (
              <Link
                to="/register"
                className="text-sm font-bold text-slate-300 hover:text-white"
              >
                Register
              </Link>
            )}

            <Link
              to={dashboardPath}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950"
            >
              {user ? "Dashboard" : "Log in"}
            </Link>
          </div>
        </nav>

        <section className="py-20 text-center sm:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Recruitment made clear
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-bold tracking-[-0.05em] sm:text-7xl">
            One hiring platform. Two focused workspaces.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Connect candidates and recruiters through one simple hiring
            platform.
          </p>
        </section>

        <section className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {roles.map(({ name, text, path, icon: Icon, color }) => (
            <Link
              key={name}
              to={user ? dashboardPath : path}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <span
                className={`grid size-11 place-items-center rounded-xl ${color}`}
              >
                <Icon size={21} />
              </span>

              <h2 className="mt-5 text-xl font-bold">{name}</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>

              <p className="mt-6 text-sm font-bold text-white">
                {user ? "Open dashboard →" : "Continue →"}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
