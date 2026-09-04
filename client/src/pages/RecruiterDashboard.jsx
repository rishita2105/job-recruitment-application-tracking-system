import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  Search,
  Star,
  CalendarDays,
  CircleCheck,
} from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    applicationsUnderReview: 0,
    shortlistedCandidates: 0,
    scheduledInterviews: 0,
    selectedCandidates: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const response = await api.get("/dashboard/recruiter");

        setStats(response.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load recruiter dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <DashboardLayout
      role="Recruiter"
      title="Hiring overview"
      subtitle="Review your jobs and candidate pipeline."
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
            title="Active jobs"
            value={stats.activeJobs}
            icon={BriefcaseBusiness}
            iconColor="text-blue-600"
            iconBackground="bg-blue-50"
          />

          <StatCard
            title="Total applicants"
            value={stats.totalApplicants}
            icon={Users}
            iconColor="text-violet-600"
            iconBackground="bg-violet-50"
          />

          <StatCard
            title="Under review"
            value={stats.applicationsUnderReview}
            icon={Search}
            iconColor="text-orange-600"
            iconBackground="bg-orange-50"
          />

          <StatCard
            title="Shortlisted"
            value={stats.shortlistedCandidates}
            icon={Star}
            iconColor="text-violet-600"
            iconBackground="bg-violet-50"
          />

          <StatCard
            title="Scheduled interviews"
            value={stats.scheduledInterviews}
            icon={CalendarDays}
            iconColor="text-blue-600"
            iconBackground="bg-blue-50"
          />

          <StatCard
            title="Selected candidates"
            value={stats.selectedCandidates}
            icon={CircleCheck}
            iconColor="text-emerald-600"
            iconBackground="bg-emerald-50"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
