import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/axiosInstance";
import JobCard from "../components/JobCard";

const initialFilters = {
  search: "",
  location: "",
  category: "",
  workMode: "",
  employmentType: "",
  experienceLevel: "",
};

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters);

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalJobs: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadJobs(targetPage = 1) {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs", {
        params: {
          ...filters,
          page: targetPage,
          limit: 8,
        },
      });

      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs(1);
  }, []);

  function updateFilter(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function searchJobs(event) {
    event.preventDefault();
    loadJobs(1);
  }

  function clearFilters() {
    setFilters(initialFilters);

    setTimeout(() => {
      window.location.reload();
    }, 0);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">Find your next opportunity</h1>

          <p className="mt-3 text-slate-300">
            Search active jobs from registered companies.
          </p>

          <form onSubmit={searchJobs} className="mt-7 flex max-w-3xl gap-2">
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Job title, description or skill"
              className="w-full rounded-xl bg-white px-4 py-3 text-slate-950 outline-none"
            />

            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold">
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold">Filters</h2>

          <FilterInput
            label="Location"
            name="location"
            value={filters.location}
            onChange={updateFilter}
          />

          <FilterInput
            label="Category"
            name="category"
            value={filters.category}
            onChange={updateFilter}
          />

          <FilterSelect
            label="Work mode"
            name="workMode"
            value={filters.workMode}
            onChange={updateFilter}
            options={[
              ["", "All"],
              ["onsite", "On-site"],
              ["remote", "Remote"],
              ["hybrid", "Hybrid"],
            ]}
          />

          <FilterSelect
            label="Employment type"
            name="employmentType"
            value={filters.employmentType}
            onChange={updateFilter}
            options={[
              ["", "All"],
              ["full-time", "Full-time"],
              ["part-time", "Part-time"],
              ["internship", "Internship"],
              ["contract", "Contract"],
            ]}
          />

          <FilterSelect
            label="Experience"
            name="experienceLevel"
            value={filters.experienceLevel}
            onChange={updateFilter}
            options={[
              ["", "All"],
              ["fresher", "Fresher"],
              ["entry-level", "Entry level"],
              ["mid-level", "Mid level"],
              ["senior-level", "Senior level"],
              ["lead", "Lead"],
            ]}
          />

          <button
            type="button"
            onClick={() => loadJobs(1)}
            className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 font-bold"
          >
            Clear
          </button>
        </aside>

        <section>
          <p className="mb-4 text-sm text-slate-500">
            {pagination.totalJobs} jobs found
          </p>

          {error && (
            <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>
          )}

          {loading ? (
            <p className="rounded-2xl bg-white p-8 text-center">
              Loading jobs...
            </p>
          ) : jobs.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center">
              No jobs match your filters.
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadJobs(pagination.page - 1)}
              className="rounded-xl bg-white px-4 py-2 font-bold disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-xl bg-white px-4 py-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadJobs(pagination.page + 1)}
              className="rounded-xl bg-white px-4 py-2 font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterInput({ label, ...properties }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold">{label}</span>

      <input
        {...properties}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function FilterSelect({ label, options, ...properties }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold">{label}</span>

      <select
        {...properties}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
