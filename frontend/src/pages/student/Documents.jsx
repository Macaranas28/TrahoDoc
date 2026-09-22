import { useEffect, useState } from "react";
import { getMyDocuments } from "../../api/documents.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDocuments().then((res) => {
      setDocuments(res.data.data.documents);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>My Documents</h1>
      {documents.length === 0 ? (
        <EmptyState message="No documents uploaded yet. Uploading will be available soon." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">File</th><th align="left">Status</th><th align="left">Uploaded</th></tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{d.fileName}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{new Date(d.uploadedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}