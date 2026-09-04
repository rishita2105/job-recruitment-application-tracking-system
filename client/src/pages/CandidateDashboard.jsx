import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Star,
  CalendarDays,
  CircleCheck,
  CircleX,
} from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function CandidateDashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const response = await api.get("/dashboard/candidate");

        setStats(response.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load candidate dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <DashboardLayout
      role="Candidate"
      title="Application overview"
      subtitle="Track your job applications and hiring progress."
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
          <StatCard
            title="Total applications"
            value={stats.totalApplications}
            icon={FileText}
            iconColor="text-blue-600"
            iconBackground="bg-blue-50"
          />

          <StatCard
            title="Under review"
            value={stats.underReview}
            icon={Search}
            iconColor="text-orange-600"
            iconBackground="bg-orange-50"
          />

          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={Star}
            iconColor="text-violet-600"
            iconBackground="bg-violet-50"
          />

          <StatCard
            title="Interviews"
            value={stats.interviews}
            icon={CalendarDays}
            iconColor="text-indigo-600"
            iconBackground="bg-indigo-50"
          />

          <StatCard
            title="Selected"
            value={stats.selected}
            icon={CircleCheck}
            iconColor="text-emerald-600"
            iconBackground="bg-emerald-50"
          />

          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={CircleX}
            iconColor="text-red-600"
            iconBackground="bg-red-50"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
