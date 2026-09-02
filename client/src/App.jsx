import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import RecruiterCompanyPage from "./pages/RecruiterCompanyPage";
import RecruiterJobsPage from "./pages/RecruiterJobsPage";
import RecruiterJobFormPage from "./pages/RecruiterJobFormPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import RecruiterApplicantsPage from "./pages/RecruiterApplicantsPage";
import RecruiterApplicationDetailsPage from "./pages/RecruiterApplicationDetailsPage";
import RecruiterInterviewFormPage from "./pages/RecruiterInterviewFormPage";
import RecruiterInterviewsPage from "./pages/RecruiterInterviewsPage";
import CandidateInterviewsPage from "./pages/CandidateInterviewsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <SavedJobsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/applications"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/company"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterCompanyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/new"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterJobFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterApplicantsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/jobs/:jobId/applicants"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterApplicantsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/applications/:applicationId"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterApplicationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:jobId/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterJobFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications/:applicationId/schedule-interview"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterInterviewFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/interviews"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterInterviewsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/interviews/:interviewId/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterInterviewFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/interviews"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateInterviewsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/jobs" element={<JobsPage />} />

      <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
