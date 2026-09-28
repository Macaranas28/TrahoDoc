import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getMyEmployerProfile, updateMyEmployerProfile } from "../../api/employers.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

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
        companyName: p.companyName, contactPerson: p.contactPerson, phone: p.phone,
        address: p.businessInformation?.address, industry: p.businessInformation?.industry,
        website: p.businessInformation?.website, description: p.businessInformation?.description,
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

  if (loading) return <Skeleton className="h-96 max-w-2xl" />;

  return (
    <div>
      <PageHeader title="Company Profile" subtitle="This information is reviewed during accreditation." action={status && <Badge status={status} />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <Card>
          <CardHeader title="Company details" />
          <Field label="Company name" required error={errors.companyName?.message}>
            <Input {...register("companyName", { required: "Required" })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Contact person" required error={errors.contactPerson?.message}>
              <Input {...register("contactPerson", { required: "Required" })} />
            </Field>
            <Field label="Phone" required error={errors.phone?.message}>
              <Input {...register("phone", { required: "Required" })} />
            </Field>
          </div>
        </Card>
        <Card>
          <CardHeader title="Business information" />
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Address"><Input {...register("address")} /></Field>
            <Field label="Industry"><Input {...register("industry")} /></Field>
          </div>
          <Field label="Website"><Input placeholder="https://" {...register("website")} /></Field>
          <Field label="Description">
            <textarea rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" {...register("description")} />
          </Field>
        </Card>
        <div className="flex justify-end"><Button type="submit" loading={isSubmitting}>Save changes</Button></div>
      </form>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}