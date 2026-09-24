import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { verifyMfaLogin } from "../../api/auth.api.js";
import Button from "../../components/common/Button.jsx";

const HOME_BY_ROLE = { student: "/student", employer: "/employer", coordinator: "/coordinator", admin: "/admin" };

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, completeMfaLogin, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  const goHome = (role) => navigate(location.state?.from || HOME_BY_ROLE[role] || "/login", { replace: true });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const result = await login(data.email, data.password);
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
      } else {
        goHome(result.user.role);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const submitMfa = async (e) => {
    e.preventDefault();
    setServerError("");
    setMfaBusy(true);
    try {
      const res = await verifyMfaLogin(mfaToken, mfaCode);
      completeMfaLogin(res.data.data.user);
      goHome(res.data.data.user.role);
    } catch (err) {
      setServerError(err.response?.data?.message || "Invalid code");
    } finally {
      setMfaBusy(false);
    }
  };

  if (mfaToken) {
    return (
      <div style={{ maxWidth: 360, margin: "4rem auto" }}>
        <h1>Two-Factor Verification</h1>
        <p>Enter the 6-digit code from your authenticator app, or a backup code.</p>
        <form onSubmit={submitMfa}>
          <input
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="123456"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            autoFocus
          />
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}
          <Button type="submit" disabled={mfaBusy}>{mfaBusy ? "Verifying…" : "Verify"}</Button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 360, margin: "4rem auto" }}>
      <h1>TrahoDoc Login</h1>
      {sessionExpired && (
        <p style={{ color: "#d97706", background: "#fffbeb", padding: "0.5rem", borderRadius: 4 }}>
          Your session expired. Please log in again.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} onFocus={clearSessionExpired}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input type="email" {...register("email", { required: "Email is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input type="password" {...register("password", { required: "Password is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in…" : "Login"}</Button>
      </form>
    </div>
  );
}