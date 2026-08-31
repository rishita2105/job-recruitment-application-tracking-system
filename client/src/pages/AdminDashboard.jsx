import { BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, FileText, UsersRound } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  const stats = [
    ["Total users", 2840, UsersRound, "blue"],
    ["Companies", 186, Building2, "violet"],
    ["Active jobs", 412, BriefcaseBusiness, "amber"],
    ["Applications", 5680, FileText, "blue"],
    ["Interviews", 326, CalendarDays, "violet"],
    ["Successful hires", 93, CheckCircle2, "emerald"],
  ];

  return (
    <DashboardLayout role="Admin" title="Platform overview" subtitle="Monitor users, jobs, companies, and hiring results.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([title, value, Icon, accent]) => <StatCard key={title} title={title} value={value} icon={Icon} accent={accent} />)}
      </section>
    </DashboardLayout>
  );
}

