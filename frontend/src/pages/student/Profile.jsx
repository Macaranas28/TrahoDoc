import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getMyProfile, updateMyProfile } from "../../api/students.api.js";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    getMyProfile().then((res) => {
      const p = res.data.data.profile;
      reset({ name: p.name, phone: p.studentProfile?.phone, course: p.studentProfile?.course, yearLevel: p.studentProfile?.yearLevel });
      setLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      await updateMyProfile({ ...data, yearLevel: Number(data.yearLevel) });
      setToast({ type: "success", message: "Profile updated" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Update failed" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Name</label>
          <input {...register("name", { required: "Name is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Phone</label>
          <input {...register("phone", { required: "Phone is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.phone && <p style={{ color: "red" }}>{errors.phone.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Course</label>
          <input {...register("course", { required: "Course is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.course && <p style={{ color: "red" }}>{errors.course.message}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Year Level</label>
          <input type="number" min={1} max={6} {...register("yearLevel", { required: "Year level is required" })} style={{ width: "100%", padding: "0.5rem" }} />
          {errors.yearLevel && <p style={{ color: "red" }}>{errors.yearLevel.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</Button>
      </form>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}