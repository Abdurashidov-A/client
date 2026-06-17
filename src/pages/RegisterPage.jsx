import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", form);

      setMessage(res.data.message || "Registration successful");

      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card shadow-sm"
        style={{ width: "100%", maxWidth: "460px" }}
      >
        <div className="card-body p-4">
          <h1 className="h3 mb-3 text-center">Register</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                name="name"
                type="text"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>

            <button className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? "Loading..." : "Register"}
            </button>
          </form>

          <p className="mt-3 mb-0 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
