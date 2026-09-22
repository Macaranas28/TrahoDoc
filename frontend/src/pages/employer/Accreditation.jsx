import { useEffect, useState } from "react";
import { getMyEmployerProfile, submitForReview } from "../../api/employers.api.js";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Accreditation() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = () => getMyEmployerProfile().then((res) => {
    setProfile(res.data.data.profile);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      await submitForReview();
      setToast({ type: "success", message: "Submitted for review" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not submit" });
    }
  };

  if (loading) return <Spinner />;
  if (!profile) return <EmptyState message="Please complete your Company Profile first." />;

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Accreditation</h1>
      <p>Status: <StatusBadge status={profile.accreditationStatus} /></p>
      {profile.accreditationRemarks && (
        <p style={{ color: "#dc2626" }}>Remarks: {profile.accreditationRemarks}</p>
      )}

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", marginTop: "1rem" }}>
        <p>Document upload will be available soon. Once your required documents are uploaded, submit here for coordinator review.</p>
        {profile.accreditationStatus === "Pending" && (
          <Button onClick={handleSubmit}>Submit for Review</Button>
        )}
      </div>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}