import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  FolderKanban,
  House,
  LogOut,
  Search,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

import { Link, NavLink, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ role, title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleKey = role.toLowerCase() || user?.role || "";

  const dashboardPath = `/${roleKey}/dashboard`;

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function navigationClass({ isActive }) {
    return `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;
  }

  async function handleLogout() {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-slate-950 p-5 text-white lg:min-h-screen lg:border-b-0">
        <Link to="/" className="flex items-center gap-3 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600">
            <BriefcaseBusiness size={20} />
          </span>
          HireFlow
        </Link>

        <nav className="mt-8 flex gap-2 lg:flex-col">
          <NavLink to={dashboardPath} end className={navigationClass}>
            <House size={18} />
            Dashboard
          </NavLink>

          {roleKey === "candidate" && (
            <>
              <NavLink to="/candidate/profile" className={navigationClass}>
                <UserRound size={18} />
                Profile
              </NavLink>

              <NavLink to="/jobs" className={navigationClass}>
                <Search size={18} />
                Find Jobs
              </NavLink>

              <NavLink to="/candidate/saved-jobs" className={navigationClass}>
                <Bookmark size={18} />
                Saved Jobs
              </NavLink>

              <NavLink to="/candidate/applications" className={navigationClass}>
                <FileText size={18} />
                Applications
              </NavLink>

              <NavLink to="/candidate/interviews" className={navigationClass}>
                <CalendarDays size={18} />
                Interviews
              </NavLink>
            </>
          )}

          {roleKey === "recruiter" && (
            <>
              <NavLink to="/recruiter/company" className={navigationClass}>
                <Building2 size={18} />
                Company
              </NavLink>

              <NavLink to="/recruiter/jobs" className={navigationClass}>
                <BriefcaseBusiness size={18} />
                Jobs
              </NavLink>

              <NavLink to="/recruiter/applications" className={navigationClass}>
                <UsersRound size={18} />
                Applicants
              </NavLink>

              <NavLink to="/recruiter/interviews" className={navigationClass}>
                <CalendarDays size={18} />
                Interviews
              </NavLink>
            </>
          )}
          {roleKey === "admin" && (
            <>
              <NavLink to="/admin/users" className={navigationClass}>
                <Users size={18} />
                Users
              </NavLink>

              <NavLink to="/admin/companies" className={navigationClass}>
                <Building2 size={18} />
                Companies
              </NavLink>

              <NavLink to="/admin/jobs" className={navigationClass}>
                <BriefcaseBusiness size={18} />
                Jobs
              </NavLink>

              <NavLink to="/admin/categories" className={navigationClass}>
                <FolderKanban size={18} />
                Categories
              </NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white lg:mt-20"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="p-5 sm:p-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              {role} dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>

            <p className="mt-2 text-slate-500">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>

              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>

            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-200 font-bold">
              {initials || "U"}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
