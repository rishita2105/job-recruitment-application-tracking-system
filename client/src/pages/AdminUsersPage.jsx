import { useEffect, useState } from "react";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";

import api from "../api/axiosInstance";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingUserId, setChangingUserId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users", {
          params: {
            search,
            role,
            status,
          },
        });

        setUsers(response.data.users);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load users");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, role, status]);

  async function handleBlockToggle(user) {
    const userIsBlocked = user.status === "blocked";
    const action = userIsBlocked ? "unblock" : "block";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingUserId(user._id);
      setError("");
      setMessage("");

      const response = await api.patch(`/admin/users/${user._id}/block`);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id
            ? {
                ...currentUser,
                status: response.data.user.status,
              }
            : currentUser,
        ),
      );

      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to update user status");
    } finally {
      setChangingUserId("");
    }
  }

  return (
    <DashboardLayout
      role="Admin"
      title="User management"
      subtitle="View, search, block and unblock platform users."
    >
      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All roles</option>
          <option value="candidate">Candidates</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100 text-sm text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">User</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userIsBlocked = user.status === "blocked";

                  return (
                    <tr key={user._id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>

                        <p className="text-sm text-slate-500">{user.email}</p>
                      </td>

                      <td className="px-5 py-4 capitalize">{user.role}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            userIsBlocked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {userIsBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {user.role === "admin" ? (
                          <span className="text-sm text-slate-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBlockToggle(user)}
                            disabled={changingUserId === user._id}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                              userIsBlocked
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {userIsBlocked ? (
                              <ShieldCheck size={17} />
                            ) : (
                              <ShieldBan size={17} />
                            )}

                            {changingUserId === user._id
                              ? "Updating..."
                              : userIsBlocked
                                ? "Unblock"
                                : "Block"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
