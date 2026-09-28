import { useState } from "react";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import RemarksModal from "../ui/RemarksModal.jsx";
import { reviewDocument, verifyDocumentIntegrity } from "../../api/documents.api.js";

export default function DocumentActions({ docId, docName, status, onDone, notify }) {
  const [integrity, setIntegrity] = useState(null); // null = not checked yet in this session
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const fail = (err, fallback) => notify({ type: "error", message: err.response?.data?.message || fallback });

  const check = async () => {
    setChecking(true);
    try {
      const res = await verifyDocumentIntegrity(docId);
      setIntegrity(res.data.data.matched);
      onDone();
    } catch (err) {
      fail(err, "Integrity check failed");
    } finally {
      setChecking(false);
    }
  };

  const review = async (newStatus, remarks) => {
    setBusy(true);
    try {
      await reviewDocument(docId, newStatus, remarks);
      notify({ type: "success", message: `Document ${newStatus.toLowerCase()}` });
      setRejectOpen(false);
      onDone();
    } catch (err) {
      fail(err, "Review failed");
    } finally {
      setBusy(false);
    }
  };

  const flagged = status === "Possible Modification";
  const reviewable = status === "Pending" || flagged;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" icon={ShieldCheck} loading={checking} onClick={check}>Check integrity</Button>
        {reviewable && !flagged && <Button size="sm" icon={Check} loading={busy} onClick={() => review("Verified")}>Verify</Button>}
        {reviewable && <Button size="sm" variant="danger" icon={X} onClick={() => setRejectOpen(true)}>Reject</Button>}
      </div>

      {integrity === true && !flagged && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <ShieldCheck className="h-3.5 w-3.5" /> SHA-256 integrity: match. No change detected since upload.
        </p>
      )}
      {flagged && (
        <p className="flex items-start gap-1.5 text-xs text-warning max-w-xs">
          <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Possible modification: the file no longer matches its recorded hash. This is a prompt to look closer, not proof of fraud. Reject it and request a re-upload, or investigate further.
        </p>
      )}

      <RemarksModal
        open={rejectOpen}
        title={`Reject "${docName}"?`}
        description="The owner will be notified and asked to upload a new file."
        required
        confirmLabel="Reject document"
        confirmVariant="danger"
        busy={busy}
        onClose={() => setRejectOpen(false)}
        onSubmit={(remarks) => review("Rejected", remarks)}
      />
    </div>
  );
}