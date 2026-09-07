import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Search,
  X,
} from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const serverUrl = "http://localhost:5000";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingCompanyId, setChangingCompanyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/companies", {
          params: {
            search,
            status,
          },
        });

        setCompanies(response.data.companies || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load companies");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, status]);

  async function changeCompanyStatus(company, newStatus) {
    const actions = {
      pending: "move back to pending review",
      approved: "approve",
      rejected: "reject",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${actions[newStatus]} "${company.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingCompanyId(company._id);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/companies/${company._id}/status`,
        {
          status: newStatus,
        },
      );

      setCompanies((currentCompanies) =>
        currentCompanies.map((currentCompany) =>
          currentCompany._id === company._id
            ? response.data.company
            : currentCompany,
        ),
      );

      setMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to update company status",
      );
    } finally {
      setChangingCompanyId("");
    }
  }

  return (
    <DashboardLayout
      role="Admin"
      title="Company management"
      subtitle="Review, approve and reject recruiter companies."
    >
      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, industry or location"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading companies...
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No companies found.
        </div>
      ) : (
        <div className="space-y-5">
          {companies.map((company) => {
            const isChanging = changingCompanyId === company._id;

            return (
              <article
                key={company._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    {company.logoUrl ? (
                      <img
                        src={`${serverUrl}${company.logoUrl}`}
                        alt={`${company.name} logo`}
                        className="size-20 shrink-0 rounded-xl border border-slate-200 object-contain"
                      />
                    ) : (
                      <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 size={32} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          {company.name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[company.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {company.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {company.industry || "Industry not provided"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={15} />

                          {company.location || "Location not provided"}
                        </span>

                        {company.email && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail size={15} />
                            {company.email}
                          </span>
                        )}

                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                          >
                            <ExternalLink size={15} />
                            Website
                          </a>
                        )}
                      </div>

                      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                        {company.description ||
                          "No company description provided."}
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                        <span className="font-semibold">Recruiter:</span>{" "}
                        {company.recruiter?.name || "Recruiter unavailable"}
                        {company.recruiter?.email && (
                          <span className="text-slate-500">
                            {" "}
                            ({company.recruiter.email})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {company.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => changeCompanyStatus(company, "approved")}
                        disabled={isChanging}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check size={17} />
                        Approve
                      </button>
                    )}

                    {company.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => changeCompanyStatus(company, "rejected")}
                        disabled={isChanging}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        <X size={17} />
                        Reject
                      </button>
                    )}

                    {company.status !== "pending" && (
                      <button
                        type="button"
                        onClick={() => changeCompanyStatus(company, "pending")}
                        disabled={isChanging}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Clock3 size={17} />
                        Pending
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
