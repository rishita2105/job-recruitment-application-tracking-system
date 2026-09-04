export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBackground = "bg-blue-50",
}) {
  return (
    <div className="min-h-[182px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBackground}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>

      <p className="mt-7 text-4xl font-bold text-slate-950">{value ?? 0}</p>

      <p className="mt-1 text-base text-slate-500">{title}</p>
    </div>
  );
}
