import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

function ConfirmPage() {
  const { token } = useParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirming your email...");

  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    const confirmEmail = async () => {
      try {
        const res = await api.get(`/auth/confirm/${token}`);

        setStatus("success");
        setMessage(res.data.message || "Email confirmed successfully");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Email confirmation failed",
        );
      }
    };

    if (!token) {
      setStatus("error");
      setMessage("Confirmation token is missing");
      return;
    }

    confirmEmail();
  }, [token]);

  const alertClass =
    status === "success"
      ? "alert alert-success"
      : status === "error"
        ? "alert alert-danger"
        : "alert alert-info";

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card shadow-sm"
        style={{ width: "100%", maxWidth: "460px" }}
      >
        <div className="card-body p-4 text-center">
          <h1 className="h3 mb-3">Email Confirmation</h1>

          <div className={alertClass}>{message}</div>

          {status === "loading" && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}

          {status !== "loading" && (
            <div className="mt-3">
              <Link className="btn btn-primary" to="/login">
                Go to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmPage;
