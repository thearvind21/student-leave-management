import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseService, LeaveApplication } from "@/services/supabaseService";
import { useMemo as useReactMemo } from "react";
import { Paperclip } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Download, Search } from "lucide-react";

function toCSV(rows: Array<Record<string, any>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const val = v == null ? '' : String(v);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

const FacultyReports = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [query, setQuery] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getAllLeaves();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const reviewerMap = useReactMemo(() => {
    const ids = Array.from(new Set(leaves.map(l => l.reviewed_by).filter(Boolean) as string[]));
    return ids;
  }, [leaves]);

  const [reviewers, setReviewers] = useState<Record<string, { full_name: string; email: string; role: string }>>({});

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (reviewerMap.length === 0) return;
      const map = await supabaseService.getProfilesByIds(reviewerMap);
      if (!ignore) setReviewers(map);
    };
    run();
    return () => { ignore = true; };
  }, [reviewerMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leaves.filter(l => {
      if (scope === 'mine' && user) {
        if (l.reviewed_by !== user.id) return false;
      }
      if (status !== 'all' && l.status !== status) return false;
      if (!q) return true;
      const hay = [
        l.leave_type,
        l.reason,
        l.student_name,
        l.student?.full_name,
        l.student?.student_id,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [leaves, status, query]);

  const exportCSV = () => {
    const rows = filtered.map(l => ({
      id: l.id,
      student: l.student_name || l.student?.full_name || 'Unknown',
      student_id: l.student?.student_id || (l as any).student_id || '',
      email: l.student?.email || '',
      leave_type: l.leave_type,
      reason: l.reason,
      start_date: l.start_date,
      end_date: l.end_date,
      applied_on: l.applied_on,
      status: l.status,
      reviewed_by: l.reviewed_by,
      reviewer_name: l.reviewed_by ? (reviewers[l.reviewed_by]?.full_name || '') : '',
      attachment_url: (l as any).attachment_url || '',
      comments: l.comments || '',
    }));
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Filter and export leave data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative md:flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search by name, type, reason..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Select value={scope} onValueChange={(v) => setScope(v as any)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mine">Reviewed by me</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Attachment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">No results</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(l => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.student_name || l.student?.full_name || 'Unknown'}</div>
                        {(l.student?.student_id || (l as any).student_id) && (
                          <div className="text-xs text-muted-foreground">{l.student?.student_id || (l as any).student_id}</div>
                        )}
                      </TableCell>
                      <TableCell>{l.leave_type}</TableCell>
                      <TableCell className="capitalize">{l.status}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.reviewed_by ? (reviewers[l.reviewed_by]?.full_name || l.reviewed_by) : '—'}
                      </TableCell>
                      <TableCell>{new Date(l.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(l.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(l.applied_on).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {(l as any).attachment_url ? (
                          <a
                            href={(l as any).attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            <Paperclip className="h-4 w-4" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyReports;
