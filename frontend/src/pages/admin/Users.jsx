import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import { getUsers, createUser, updateUserStatus } from "../../api/users.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

const ROLE_FILTERS = ["", "student", "coordinator", "employer", "admin"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { role: "coordinator" } });

  const load = () => {
    setLoading(true);
    return getUsers(roleFilter ? { role: roleFilter } : {})
      .then((res) => setUsers(res.data.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const closeCreate = () => { setCreateOpen(false); reset({ role: "coordinator" }); };

  const onCreate = async (data) => {
    try {
      await createUser(data);
      setToast({ type: "success", message: `${data.role} account created` });
      closeCreate();
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not create account" });
    }
  };

  const confirmStatusChange = async () => {
    setBusy(true);
    const next = target.status === "active" ? "disabled" : "active";
    try {
      await updateUserStatus(target.id, next);
      setToast({ type: "success", message: `Account ${next}` });
      setTarget(null);
      load();
    } catch (err) {
      setTarget(null);
      setToast({ type: "error", message: err.response?.data?.message || "Could not update status" });
    } finally {
      setBusy(false);
    }
  };

  const disabling = target?.status === "active";

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create staff accounts and control who can sign in."
        action={<Button icon={UserPlus} onClick={() => setCreateOpen(true)}>Create staff account</Button>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {ROLE_FILTERS.map((r) => (
          <Button key={r || "all"} size="sm" variant={roleFilter === r ? "primary" : "secondary"} onClick={() => setRoleFilter(r)} className="capitalize">
            {r || "All"}
          </Button>
        ))}
      </div>

      <Card>
        {loading ? <Skeleton className="h-48" /> : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" message="Try a different filter." />
        ) : (
          <Table>
            <thead><tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th>Last login</Th><Th> </Th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </Td>
                  <Td className="capitalize">{u.role}</Td>
                  <Td><Badge status={u.status} /></Td>
                  <Td className="text-muted whitespace-nowrap">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}</Td>
                  <Td className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => setTarget(u)}>{u.status === "active" ? "Disable" : "Activate"}</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={createOpen} title="Create staff account" confirmLabel="Create account" busy={isSubmitting} onClose={closeCreate} onConfirm={handleSubmit(onCreate)}>
        <Field label="Full name" required error={errors.name?.message}>
          <Input {...register("name", { required: "Required" })} />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" {...register("email", { required: "Required" })} />
        </Field>
        <Field label="Temporary password" required error={errors.password?.message}>
          <Input type="password" {...register("password", { required: "Required" })} />
          <p className="text-xs text-muted mt-1">8 to 64 characters with an uppercase letter, a lowercase letter, and a number.</p>
        </Field>
        <Field label="Role">
          <Select {...register("role")}>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
      </Modal>

      <Modal
        open={!!target}
        title={disabling ? "Disable this account?" : "Activate this account?"}
        confirmLabel={disabling ? "Disable" : "Activate"}
        confirmVariant={disabling ? "danger" : "primary"}
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={confirmStatusChange}
      >
        <p className="text-sm text-slate-600">
          {disabling
            ? `${target?.email} will be signed out immediately and will not be able to log in.`
            : `${target?.email} will be able to log in again.`}
        </p>
      </Modal>

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}