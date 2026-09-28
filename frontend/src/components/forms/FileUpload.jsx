import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import Button from "../ui/Button.jsx";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 5 * 1024 * 1024;

export default function FileUpload({ label = "Upload", onUpload, disabled }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    if (file.size > MAX_BYTES) return setError("File is too large. Maximum size is 5 MB.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return setError("Only PDF, JPG, and PNG files are allowed.");
    }

    setBusy(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleChange} className="hidden" disabled={disabled || busy} />
      <Button type="button" variant="secondary" size="sm" icon={Upload} loading={busy} disabled={disabled} onClick={() => inputRef.current.click()}>
        {busy ? "Uploading…" : label}
      </Button>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}