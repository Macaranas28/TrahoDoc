import { useRef, useState } from "react";
import Button from "../common/Button.jsx";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 5 * 1024 * 1024;

// Controlled, reusable: the parent decides what "upload" means (create vs replace)
export default function FileUpload({ label = "Upload", onUpload, disabled }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows re-selecting the same file name later
    if (!file) return;

    setError("");
    if (file.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 5 MB.");
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
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
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        style={{ display: "none" }}
        disabled={disabled || busy}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || busy}
        onClick={() => inputRef.current.click()}
      >
        {busy ? "Uploading…" : label}
      </Button>
      {error && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>{error}</p>}
    </div>
  );
}