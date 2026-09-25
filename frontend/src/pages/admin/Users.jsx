import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUsers, createUser, updateUserStatus } from "../../api/users.api.js";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";

const ROLE_FILTERS = ["", "student", "coordinator", "employer", "admin"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    getUsers(roleFilter ? { role: roleFilter } : {}).then((res) => {
      setUsers(res.data.data.users);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [roleFilter]);

  const onCreate = async (data) => {
    try {
      await createUser(data);
      setToast({ type: "success", message: `${data.role} account created` });
      reset();
      setShowCreate(false);
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not create user" });
    }
  };

  const toggleStatus = async (user) => {
    const next = user.status === "active" ? "disabled" : "active";
    if (!confirm(`Set ${user.email} to "${next}"?`)) return;
    try {
      await updateUserStatus(user.id, next);
      setToast({ type: "success", message: `User ${next}` });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not update status" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>User Management</h1>
        <Button onClick={() => setShowCreate((s) => !s)}>{showCreate ? "Cancel" : "Create Coordinator/Admin"}</Button>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit(onCreate)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", maxWidth: 420, marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>Name</label>
            <input {...register("name", { required: "Required" })} style={{ width: "100%", padding: "0.4rem" }} />
            {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>Email</label>
            <input type="email" {...register("email", { required: "Required" })} style={{ width: "100%", padding: "0.4rem" }} />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>Temporary Password</label>
            <input type="text" {...register("password", { required: "Required" })} style={{ width: "100%", padding: "0.4rem" }} />
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>Role</label>
            <select {...register("role", { required: true })} style={{ width: "100%", padding: "0.4rem" }}>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create"}</Button>
        </form>
      )}

      <div style={{ marginBottom: "1rem" }}>
        {ROLE_FILTERS.map((r) => (
          <Button
            key={r || "all"}
            variant={roleFilter === r ? "primary" : "secondary"}
            onClick={() => setRoleFilter(r)}
            style={{ marginRight: "0.5rem" }}
          >
            {r || "All"}
          </Button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">Name</th><th align="left">Email</th><th align="left">Role</th><th align="left">Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                <td style={{ color: u.status === "active" ? "#16a34a" : "#dc2626" }}>{u.status}</td>
                <td>
                  <Button variant="secondary" onClick={() => toggleStatus(u)}>
                    {u.status === "active" ? "Disable" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}