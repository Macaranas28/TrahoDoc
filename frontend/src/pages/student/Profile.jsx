import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getMyProfile, updateMyProfile } from "../../api/students.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

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

  if (loading) return <Skeleton className="h-96 max-w-xl" />;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Keep your details up to date. You need a complete profile to apply." />
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Full name" required error={errors.name?.message}>
            <Input {...register("name", { required: "Name is required" })} />
          </Field>
          <Field label="Phone number" required error={errors.phone?.message}>
            <Input placeholder="09171234567" {...register("phone", { required: "Phone is required" })} />
          </Field>
          <Field label="Course" required error={errors.course?.message}>
            <Input placeholder="BS Information Technology" {...register("course", { required: "Course is required" })} />
          </Field>
          <Field label="Year level" required error={errors.yearLevel?.message}>
            <Input type="number" min={1} max={6} {...register("yearLevel", { required: "Year level is required" })} />
          </Field>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>Save changes</Button>
          </div>
        </form>
      </Card>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}