export default function StatCard({ title, value, icon: Icon, accent = "blue" }) {
  const accents = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid size-10 place-items-center rounded-xl ${accents[accent]}`}>
        <Icon size={19} />
      </div>
      <p className="mt-5 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{title}</p>
    </article>
  );
}

