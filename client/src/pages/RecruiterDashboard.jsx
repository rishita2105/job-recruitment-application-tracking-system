import { BriefcaseBusiness, CalendarDays, CheckCircle2, Search, Star, UsersRound } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function RecruiterDashboard() {
  const stats = [
    ["Active jobs", 8, BriefcaseBusiness, "blue"],
    ["Total applicants", 148, UsersRound, "violet"],
    ["Under review", 42, Search, "amber"],
    ["Shortlisted", 24, Star, "violet"],
    ["Scheduled interviews", 11, CalendarDays, "blue"],
    ["Selected candidates", 7, CheckCircle2, "emerald"],
  ];

  return (
    <DashboardLayout role="Recruiter" title="Hiring overview" subtitle="Review your jobs and candidate pipeline.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([title, value, Icon, accent]) => <StatCard key={title} title={title} value={value} icon={Icon} accent={accent} />)}
      </section>
    </DashboardLayout>
  );
}

