import { Building2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

const emptyCompany = {
  name: "",
  description: "",
  industry: "",
  location: "",
  website: "",
  email: "",
  phone: "",
  companySize: "",
  foundedYear: "",
  logoUrl: "",
  status: "pending",
};

export default function RecruiterCompanyPage() {
  const [logoPreview, setLogoPreview] = useState("");
  const [company, setCompany] = useState(emptyCompany);
  const [companyExists, setCompanyExists] = useState(false);

  const [logo, setLogo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await api.get("/recruiter/company");

        if (response.data.company) {
          setCompany({
            ...emptyCompany,
            ...response.data.company,
            foundedYear: response.data.company.foundedYear || "",
          });

          setCompanyExists(true);
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load company profile",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setCompany((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveCompany(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/recruiter/company", {
        name: company.name,
        description: company.description,
        industry: company.industry,
        location: company.location,
        website: company.website,
        email: company.email,
        phone: company.phone,
        companySize: company.companySize,
        foundedYear: company.foundedYear,
      });

      setCompany({
        ...emptyCompany,
        ...response.data.company,
        foundedYear: response.data.company.foundedYear || "",
      });

      setCompanyExists(true);

      setMessage("Company profile saved successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save company profile",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(event) {
    event.preventDefault();

    if (!logo) {
      setError("Please select a company logo");
      return;
    }

    if (!companyExists) {
      setError("Save the company profile before uploading a logo");

      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    const formData = new FormData();

    formData.append("logo", logo);

    try {
      const response = await api.post("/recruiter/company/logo", formData);

      setCompany((current) => ({
        ...current,
        logoUrl: response.data.logoUrl,
      }));

      if (logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoPreview(
        `${cleanServerUrl}${response.data.logoUrl}?time=${Date.now()}`,
      );

      setLogo(null);

      setMessage("Company logo uploaded successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to upload company logo",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p>Loading company profile...</p>
      </main>
    );
  }

  return (
    <DashboardLayout
      role="Recruiter"
      title="Company profile"
      subtitle="Add information candidates will see."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {message && (
          <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {companyExists && <CompanyStatus status={company.status} />}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100">
              {company.logoUrl ? (
                <img
                  src={`${serverUrl}${company.logoUrl}`}
                  alt={company.name || "Company logo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 size={38} className="text-slate-400" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold">Company logo</h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload a JPG, PNG or WebP image. Maximum size: 2 MB.
              </p>

              <form
                onSubmit={uploadLogo}
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0];

                    if (!selectedFile) {
                      setLogo(null);
                      setLogoPreview("");
                      return;
                    }

                    if (logoPreview.startsWith("blob:")) {
                      URL.revokeObjectURL(logoPreview);
                    }

                    setLogo(selectedFile);

                    setLogoPreview(URL.createObjectURL(selectedFile));
                  }}
                  className="block rounded-xl border border-slate-300 bg-white p-2 text-sm"
                />

                <button
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-60"
                >
                  <Upload size={17} />

                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <form
          onSubmit={saveCompany}
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-xl font-bold">Company information</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Input
              label="Company name"
              name="name"
              value={company.name}
              onChange={updateField}
              placeholder="Example Technologies"
              required
            />

            <Input
              label="Industry"
              name="industry"
              value={company.industry}
              onChange={updateField}
              placeholder="Information Technology"
            />

            <Input
              label="Location"
              name="location"
              value={company.location}
              onChange={updateField}
              placeholder="Hyderabad, India"
            />

            <Input
              label="Website"
              name="website"
              type="url"
              value={company.website}
              onChange={updateField}
              placeholder="https://example.com"
            />

            <Input
              label="Company email"
              name="email"
              type="email"
              value={company.email}
              onChange={updateField}
              placeholder="careers@example.com"
            />

            <Input
              label="Phone number"
              name="phone"
              value={company.phone}
              onChange={updateField}
              placeholder="+91 9876543210"
            />

            <label className="block">
              <span className="text-sm font-semibold">Company size</span>

              <select
                name="companySize"
                value={company.companySize}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">Select company size</option>

                <option value="1-10">1–10</option>
                <option value="11-50">11–50</option>
                <option value="51-200">51–200</option>
                <option value="201-500">201–500</option>
                <option value="501-1000">501–1000</option>
                <option value="1000+">1000+</option>
              </select>
            </label>

            <Input
              label="Founded year"
              name="foundedYear"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={company.foundedYear}
              onChange={updateField}
              placeholder="2020"
            />
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold">Company description</span>

            <textarea
              name="description"
              value={company.description}
              onChange={updateField}
              rows="6"
              maxLength="2000"
              placeholder="Describe the company, its products, values and work culture..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </label>

          <button
            disabled={saving}
            className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save company profile"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, type = "text", ...properties }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>

      <input
        type={type}
        {...properties}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function CompanyStatus({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  const messages = {
    pending: "Your company profile is waiting for admin approval.",
    approved: "Your company profile has been approved.",
    rejected:
      "Your company profile was rejected. Update the information or contact the administrator.",
  };

  return (
    <div
      className={`rounded-xl p-4 text-sm font-semibold ${
        styles[status] || styles.pending
      }`}
    >
      {messages[status] || messages.pending}
    </div>
  );
}
