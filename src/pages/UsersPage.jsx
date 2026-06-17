import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedAll = useMemo(() => {
    return users.length > 0 && selectedIds.length === users.length;
  }, [users, selectedIds]);

  const hasSelectedUsers = selectedIds.length > 0;

  const logoutAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleRequestError = (error, fallbackMessage) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    if (status === 401 || status === 403) {
      logoutAndRedirect();
      return;
    }

    setError(backendMessage || fallbackMessage);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await api.get("/users");

      setUsers(res.data.users);
      setCurrentUser(res.data.currentUser);
    } catch (error) {
      handleRequestError(error, "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelectAll = () => {
    if (selectedAll) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(users.map((user) => user.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }

      return [...prev, id];
    });
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleBlock = async () => {
    clearMessages();

    try {
      const res = await api.patch("/users/block", {
        ids: selectedIds,
      });

      setMessage(res.data.message);
      setSelectedIds([]);

      if (res.data.blockedCurrentUser) {
        logoutAndRedirect();
        return;
      }

      fetchUsers();
    } catch (error) {
      handleRequestError(error, "Failed to block users");
    }
  };

  const handleUnblock = async () => {
    clearMessages();

    try {
      const res = await api.patch("/users/unblock", {
        ids: selectedIds,
      });

      setMessage(res.data.message);
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      handleRequestError(error, "Failed to unblock users");
    }
  };

  const handleDelete = async () => {
    clearMessages();

    try {
      const res = await api.delete("/users", {
        data: {
          ids: selectedIds,
        },
      });

      setMessage(res.data.message);
      setSelectedIds([]);

      if (res.data.deletedCurrentUser || res.data.blockedCurrentUser) {
        logoutAndRedirect();
        return;
      }

      fetchUsers();
    } catch (error) {
      handleRequestError(error, "Failed to delete users");
    }
  };

  const handleDeleteUnverified = async () => {
    clearMessages();

    try {
      const res = await api.delete("/users/unverified");

      setMessage(res.data.message);
      setSelectedIds([]);

      if (res.data.deletedCurrentUser) {
        logoutAndRedirect();
        return;
      }

      fetchUsers();
    } catch (error) {
      handleRequestError(error, "Failed to delete unverified users");
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "active") return "badge text-bg-success";
    if (status === "blocked") return "badge text-bg-danger";
    return "badge text-bg-secondary";
  };

  const formatDate = (value) => {
    if (!value) return "Never";

    return new Date(value).toLocaleString();
  };

  return (
    <>
      <Navbar />

      <main className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
          <div>
            <h1 className="h3 mb-1">Users</h1>
            <p className="text-muted mb-0">
              Manage registered users, block, unblock and delete accounts.
            </p>
          </div>

          {currentUser && (
            <div className="text-muted small">
              Current user: <strong>{currentUser.email}</strong>
            </div>
          )}
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-danger"
                onClick={handleBlock}
                disabled={!hasSelectedUsers}
                title="Block selected users"
              >
                Block
              </button>

              <button
                className="btn btn-outline-success"
                onClick={handleUnblock}
                disabled={!hasSelectedUsers}
                title="Unblock selected users"
              >
                <i className="bi bi-unlock"></i>
              </button>

              <button
                className="btn btn-outline-danger"
                onClick={handleDelete}
                disabled={!hasSelectedUsers}
                title="Delete selected users"
              >
                <i className="bi bi-trash"></i>
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={handleDeleteUnverified}
                title="Delete all unverified users"
              >
                <i className="bi bi-person-x"></i>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "48px" }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last login</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelectOne(user.id)}
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.last_login_at)}</td>
                      <td>
                        <span className={getStatusBadgeClass(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export default UsersPage;
