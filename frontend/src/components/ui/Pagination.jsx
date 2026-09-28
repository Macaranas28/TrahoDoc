import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button.jsx";

export default function Pagination({ page, totalPages, total, onChange }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted">Page {page} of {totalPages} · {total} total</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}