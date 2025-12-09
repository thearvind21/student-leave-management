import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const decodePayload = (q: string | null) => {
  if (!q) return null;
  try {
    const json = decodeURIComponent(escape(atob(q)));
    return JSON.parse(json);
  } catch {
    // Support legacy QR text: "Leave#<id>|<name>|<status>"
    try {
      const text = q;
      if (text.includes("Leave#") && text.includes("|")) {
        const raw = text.split("Leave#").pop() || "";
        const [id, name, status] = raw.split("|");
        return { id, name, status } as any;
      }
    } catch {}
    return null;
  }
};

const statusBadge = (status?: string) => {
  const s = (status || '').toLowerCase();
  const base = "px-2 py-0.5 rounded text-xs font-medium";
  if (s === 'approved') return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;
  if (s === 'rejected') return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
  if (s === 'pending') return <span className={`${base} bg-amber-100 text-amber-700`}>Pending</span>;
  return <span className={`${base} bg-slate-100 text-slate-700`}>{status || 'Unknown'}</span>;
};

const Verify = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const q = params.get('q');

  const data = useMemo(() => decodePayload(q), [q]);

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Leave Verification</CardTitle>
            <CardDescription>Scanned QR details</CardDescription>
          </CardHeader>
          <CardContent>
            {!data ? (
              <div className="text-sm text-muted-foreground">Invalid or unreadable QR data.</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Leave ID</div>
                  <div className="font-medium break-all">{data.id || '—'}</div>
                  <div className="text-muted-foreground">Applicant</div>
                  <div className="font-medium">{data.name || '—'}</div>
                  {data.role && (
                    <>
                      <div className="text-muted-foreground">Role</div>
                      <div className="font-medium">{data.role}</div>
                    </>
                  )}
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">{statusBadge(data.status)}</div>
                  {data.leave_type && (
                    <>
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium">{data.leave_type}</div>
                    </>
                  )}
                  {data.start_date && (
                    <>
                      <div className="text-muted-foreground">From</div>
                      <div className="font-medium">{new Date(data.start_date).toLocaleDateString()}</div>
                    </>
                  )}
                  {data.end_date && (
                    <>
                      <div className="text-muted-foreground">To</div>
                      <div className="font-medium">{new Date(data.end_date).toLocaleDateString()}</div>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Verification source: QR payload
                  {data.generated_at && (
                    <span> • Issued {new Date(data.generated_at).toLocaleString()}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Verify;
