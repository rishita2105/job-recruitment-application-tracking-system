import { BriefcaseBusiness, House, LogOut, UserRound } from "lucide-react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ role, title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <a
            className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold"
            href="#"
          >
            <House size={18} /> Dashboard
          </a>
          {role.toLowerCase() === "candidate" && (
            <Link
              to="/candidate/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <UserRound size={18} />
              Profile
            </Link>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/10 lg:mt-20"
        >
          <LogOut size={18} /> Exit preview
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
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-200 font-bold">
            {initials}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
