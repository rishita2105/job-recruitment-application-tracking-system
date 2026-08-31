import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();

  const requestedRole = searchParams.get("role");

  const initialRole = ["candidate", "recruiter"].includes(requestedRole)
    ? requestedRole
    : "candidate";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const newUser = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate(`/${newUser.role}/dashboard`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to create account",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
      >
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Admin accounts cannot be created from this public form.
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <label htmlFor="role" className="mt-7 block text-sm font-semibold">
          I am joining as
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={updateField}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <label htmlFor="name" className="mt-5 block text-sm font-semibold">
          Full name
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
          minLength="2"
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <label htmlFor="email" className="mt-5 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          value={form.email}
          onChange={updateField}
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="mt-5 block text-sm font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              value={form.password}
              onChange={updateField}
              type="password"
              required
              minLength="8"
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mt-5 block text-sm font-semibold"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              type="password"
              required
              minLength="8"
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          disabled={submitting}
          className="mt-7 w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-blue-600">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
