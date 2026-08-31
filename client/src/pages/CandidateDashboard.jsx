import { BriefcaseBusiness, CalendarDays, CheckCircle2, Search, Star, XCircle } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function CandidateDashboard() {
  const stats = [
    ["Total applications", 12, BriefcaseBusiness, "blue"],
    ["Under review", 5, Search, "amber"],
    ["Shortlisted", 3, Star, "violet"],
    ["Interviews", 2, CalendarDays, "blue"],
    ["Selected", 1, CheckCircle2, "emerald"],
    ["Rejected", 1, XCircle, "rose"],
  ];

  return (
    <DashboardLayout role="Candidate" title="Welcome, Rishita" subtitle="Here is the current status of your job search.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([title, value, Icon, accent]) => <StatCard key={title} title={title} value={value} icon={Icon} accent={accent} />)}
      </section>
    </DashboardLayout>
  );
}

