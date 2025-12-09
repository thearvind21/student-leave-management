import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { contactService, ContactRequest } from '@/services/contactService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

const StatusBadge = ({ status }: { status: ContactRequest['status'] }) => {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    closed: 'bg-gray-100 text-gray-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{status.replace('_',' ')}</span>;
};

const AdminContacts: React.FC = () => {
  const [rows, setRows] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string| null>(null);
  const [filter, setFilter] = useState<'all' | ContactRequest['status']>('all');
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');
  const [pendingDecision, setPendingDecision] = useState<null | { id: string; name: string; email: string; action: 'accepted' | 'rejected' }>(null);
  const [savingDecision, setSavingDecision] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.list();
      setRows(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: ContactRequest['status']) => {
    try {
      await contactService.updateStatus(id, status);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    }
  };

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter);

  const decidedStatuses: Array<ContactRequest['status']> = ['accepted','rejected','closed'];

  const startDecision = (r: ContactRequest, action: 'accepted' | 'rejected') => {
    setPendingDecision({ id: r.id, name: r.name, email: r.email, action });
    setDecisionNote('');
    setDecisionOpen(true);
  };

  const confirmDecision = async () => {
    if (!pendingDecision) return;
    try {
      setSavingDecision(true);
      await contactService.updateStatus(pendingDecision.id, pendingDecision.action as any, decisionNote.trim() || undefined);
      try {
        await contactService.sendDecisionEmail({
          to: pendingDecision.email,
          name: pendingDecision.name,
          decision: pendingDecision.action,
          note: decisionNote.trim() || undefined,
        });
        toast.success('Email sent');
      } catch (_) { /* ignore email errors for now */ }
      await load();
      setDecisionOpen(false);
      setPendingDecision(null);
    } catch (e: any) {
      const msg = e?.message || 'Failed to update';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <Layout>
      <section className="px-4 pt-24 pb-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold">Demo Requests</h1>
          <div className="ml-auto flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
            <Button variant="secondary" onClick={load}>Refresh</Button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Institution</th>
                  <th className="text-left px-4 py-3">Message</th>
                  <th className="text-left px-4 py-3">Decision note</th>
                  <th className="text-left px-4 py-3">Decided at</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-6" colSpan={9}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="px-4 py-6" colSpan={9}>No demo requests yet.</td></tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3"><a className="text-indigo-600 underline" href={`mailto:${r.email}`}>{r.email}</a></td>
                      <td className="px-4 py-3">{r.institution}</td>
                      <td className="px-4 py-3 max-w-md whitespace-pre-wrap">{r.message}</td>
                      <td className="px-4 py-3 max-w-md whitespace-pre-wrap text-slate-700 dark:text-slate-300">{r.decision_note || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.decision_at ? new Date(r.decision_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status as any} /></td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, 'in_progress' as any)} disabled={decidedStatuses.includes(r.status as any)}>In progress</Button>
                        {!decidedStatuses.includes(r.status as any) && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => startDecision(r as any, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="destructive" onClick={() => startDecision(r as any, 'rejected')}>Reject</Button>
                          </>
                        )}
                        <a
                          className="inline-flex items-center text-sm font-medium text-indigo-600 underline ml-2"
                          href={`mailto:${r.email}?subject=${encodeURIComponent('Regarding your demo request')}&body=${encodeURIComponent('Hi ' + r.name + ',\n\nThanks for your interest. We can schedule a quick walkthrough.\n\nRegards,\nAdmin')}`}
                        >Reply</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision notes dialog */}
        <AlertDialog open={decisionOpen} onOpenChange={setDecisionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingDecision?.action === 'accepted' ? 'Accept request' : 'Reject request'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Add a brief note for this decision (optional). This will be saved with the request and included in the email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Textarea
                placeholder="Add a short note (optional)"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDecision(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDecision} disabled={savingDecision}>
                {pendingDecision?.action === 'accepted' ? 'Accept' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </Layout>
  );
};

export default AdminContacts;
