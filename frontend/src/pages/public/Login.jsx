import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/common/Button.jsx";

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    setServerError("");
    try {
           const loggedInUser = await login(data.email, data.password);
      const homeByRole = {
        student: "/student",
        employer: "/employer",
        coordinator: "/coordinator",
        admin: "/admin",
      };
      navigate(location.state?.from || homeByRole[loggedInUser.role] || "/login", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "4rem auto" }}>
      <h1>TrahoDoc Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
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