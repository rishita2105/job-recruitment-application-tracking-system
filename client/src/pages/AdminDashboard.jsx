import { useEffect, useState } from "react";
import {
  Users,
  UserRound,
  UserCog,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  CircleCheck,
} from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalAdmins: 0,
    totalCompanies: 0,
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    successfulHires: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const response = await api.get("/dashboard/admin");

        setStats(response.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load admin dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <DashboardLayout
      role="Admin"
      title="Platform overview"
      subtitle="Review users, companies, jobs and hiring activity."
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          Loading dashboard...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total users" value={stats.totalUsers} icon={Users} />

          <StatCard
            title="Total candidates"
            value={stats.totalCandidates}
            icon={UserRound}
            iconColor="text-indigo-600"
            iconBackground="bg-indigo-50"
          />

          <StatCard
            title="Total recruiters"
            value={stats.totalRecruiters}
            icon={UserCog}
            iconColor="text-violet-600"
            iconBackground="bg-violet-50"
          />

          <StatCard
            title="Total admins"
            value={stats.totalAdmins}
            icon={ShieldCheck}
            iconColor="text-orange-600"
            iconBackground="bg-orange-50"
          />

          <StatCard
            title="Total companies"
            value={stats.totalCompanies}
            icon={Building2}
            iconColor="text-cyan-600"
            iconBackground="bg-cyan-50"
          />

          <StatCard
            title="Active jobs"
            value={stats.activeJobs}
            icon={BriefcaseBusiness}
          />

          <StatCard
            title="Total applications"
            value={stats.totalApplications}
            icon={FileText}
            iconColor="text-violet-600"
            iconBackground="bg-violet-50"
          />

          <StatCard
            title="Interviews scheduled"
            value={stats.interviewsScheduled}
            icon={CalendarDays}
            iconColor="text-orange-600"
            iconBackground="bg-orange-50"
          />

          <StatCard
            title="Successful hires"
            value={stats.successfulHires}
            icon={CircleCheck}
            iconColor="text-emerald-600"
            iconBackground="bg-emerald-50"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
