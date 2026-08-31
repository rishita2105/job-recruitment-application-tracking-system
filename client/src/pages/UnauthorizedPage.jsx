import { Link } from "react-router";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-center text-white">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">Access denied</p>
        <h1 className="mt-4 text-4xl font-bold">This page belongs to another role.</h1>
        <p className="mt-3 text-slate-400">Your account does not have permission to open it.</p>
        <Link to="/" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-bold text-slate-950">
          Return home
        </Link>
      </div>
    </main>
  );
}
