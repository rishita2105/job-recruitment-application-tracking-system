import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function dashboardFor(role) {
  return `/${role}/dashboard`;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!loading && user) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login(form);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || dashboardFor(loggedInUser.role), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Welcome back</p>
        <h1 className="mt-3 text-3xl font-bold">Log in to HireFlow</h1>
        <p className="mt-2 text-sm text-slate-500">Enter the account you created during registration.</p>

        {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}

        <label htmlFor="email" className="mt-7 block text-sm font-semibold">Email</label>
        <input id="email" name="email" value={form.email} onChange={updateField} type="email" required autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />

        <label htmlFor="password" className="mt-5 block text-sm font-semibold">Password</label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            value={form.password}
            onChange={updateField}
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid place-items-center px-3 text-slate-500 hover:text-slate-800"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button disabled={submitting} className="mt-7 w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          New to HireFlow? <Link to="/register" className="font-bold text-blue-600">Create an account</Link>
        </p>
        <Link to="/" className="mt-3 block text-center text-sm font-semibold text-slate-500">Back to home</Link>
      </form>
    </main>
  );
}
