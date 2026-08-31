import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-center text-white">
      <div>
        <p className="text-7xl font-black text-blue-500">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <Link to="/" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-bold text-slate-950">Go home</Link>
      </div>
    </main>
  );
}

