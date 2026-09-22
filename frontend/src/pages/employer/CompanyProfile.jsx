import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getMyEmployerProfile, updateMyEmployerProfile } from "../../api/employers.api.js";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => getMyEmployerProfile().then((res) => {
    const p = res.data.data.profile;
    if (p) {
      setStatus(p.accreditationStatus);
      reset({
        companyName: p.companyName,
        contactPerson: p.contactPerson,
        phone: p.phone,
        address: p.businessInformation?.address,
        industry: p.businessInformation?.industry,
        website: p.businessInformation?.website,
        description: p.businessInformation?.description,
      });
    }
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      await updateMyEmployerProfile(data);
      setToast({ type: "success", message: "Company profile saved" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Company Profile</h1>
        {status && <StatusBadge status={status} />}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Company Name</label>
          <input {...register("companyName", { required: "Required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.companyName && <p style={{ color: "red" }}>{errors.companyName.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Contact Person</label>
          <input {...register("contactPerson", { required: "Required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.contactPerson && <p style={{ color: "red" }}>{errors.contactPerson.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Phone</label>
          <input {...register("phone", { required: "Required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.phone && <p style={{ color: "red" }}>{errors.phone.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Address</label>
          <input {...register("address")} style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Industry</label>
          <input {...register("industry")} style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Website</label>
          <input {...register("website")} placeholder="https://…" style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Description</label>
          <textarea {...register("description")} rows={3} style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</Button>
      </form>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}