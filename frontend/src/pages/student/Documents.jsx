import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getMyDocuments } from "../../api/documents.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDocuments().then((res) => setDocuments(res.data.data.documents)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="My Documents" subtitle="Everything you have uploaded and its verification status." />
      <Card>
        {loading ? <Skeleton className="h-40" /> : documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded" message="Upload documents from the Tracking page." />
        ) : (
          <Table>
            <thead><tr><Th>Document</Th><Th>File</Th><Th>Status</Th><Th>Uploaded</Th></tr></thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <Td className="font-medium">{d.documentType}</Td>
                  <Td className="text-muted">{d.fileName}</Td>
                  <Td>
                    <Badge status={d.status} />
                    {d.remarks && <p className="text-xs text-danger mt-1">{d.remarks}</p>}
                  </Td>
                  <Td className="text-muted whitespace-nowrap">{new Date(d.uploadedAt).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}