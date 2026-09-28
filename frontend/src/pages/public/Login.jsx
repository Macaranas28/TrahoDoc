import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { verifyMfaLogin } from "../../api/auth.api.js";
import Button from "../../components/ui/Button.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";

const HOME_BY_ROLE = { student: "/student", employer: "/employer", coordinator: "/coordinator", admin: "/admin" };

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, completeMfaLogin, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  const goHome = (role) => navigate(location.state?.from || HOME_BY_ROLE[role] || "/login", { replace: true });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const result = await login(data.email, data.password);
      if (result.mfaRequired) setMfaToken(result.mfaToken);
      else goHome(result.user.role);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-white mb-4">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TrahoDoc</h1>
          <p className="text-sm text-muted mt-1">Secure OJT Management Portal</p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          {mfaToken ? (
            <form onSubmit={submitMfa}>
              <h2 className="text-base font-semibold mb-1">Two-Factor Verification</h2>
              <p className="text-sm text-muted mb-4">Enter the 6-digit code from your authenticator app, or a backup code.</p>
              <Field>
                <Input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  autoFocus
                />
              </Field>
              {serverError && <p className="text-sm text-danger mb-3">{serverError}</p>}
              <Button type="submit" loading={mfaBusy} className="w-full">Verify</Button>
            </form>
          ) : (
            <>
              {sessionExpired && (
                <div className="bg-warning-light text-warning text-sm rounded-lg px-3 py-2 mb-4">
                  Your session expired. Please log in again.
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} onFocus={clearSessionExpired}>
                <Field label="Email" required error={errors.email?.message}>
                  <Input type="email" placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
                </Field>
                <Field label="Password" required error={errors.password?.message}>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...register("password", { required: "Password is required" })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                {serverError && <p className="text-sm text-danger mb-3">{serverError}</p>}
                <Button type="submit" loading={isSubmitting} className="w-full">Login</Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Secure • Verified • Organized
        </p>
      </div>
    </div>
  );
}