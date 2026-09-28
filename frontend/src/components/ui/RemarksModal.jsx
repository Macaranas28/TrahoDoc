import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

export default function RemarksModal({ open, title, description, required, confirmLabel, confirmVariant, busy, onClose, onSubmit }) {
  const [text, setText] = useState("");
  useEffect(() => { if (open) setText(""); }, [open]);

  const tooShort = required && text.trim().length < 3;

  return (
    <Modal
      open={open}
      title={title}
      confirmLabel={confirmLabel}
      confirmVariant={confirmVariant}
      busy={busy}
      confirmDisabled={tooShort}
      onClose={onClose}
      onConfirm={() => onSubmit(text.trim())}
    >
      {description && <p className="text-sm text-slate-600 mb-3">{description}</p>}
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Remarks {required ? <span className="text-danger">*</span> : <span className="text-muted">(optional)</span>}
      </label>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      {tooShort && <p className="text-xs text-muted mt-1">Please enter at least 3 characters.</p>}
    </Modal>
  );
}