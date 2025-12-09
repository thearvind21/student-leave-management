import { supabase } from '@/integrations/supabase/client';

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  institution: string;
  message: string;
  status: 'new' | 'in_progress' | 'accepted' | 'rejected' | 'closed';
  handled_by?: string | null;
  created_at: string;
  decision_note?: string | null;
  decision_at?: string | null;
};

export const contactService = {
  async submit(data: { name: string; email: string; institution: string; message: string; }) {
    // 1) Insert request
    const { error } = await supabase
      .from('contact_requests' as any)
      .insert({ ...data });
    if (error) throw error;

    // 2) Notify admins in-app
    try {
      const { data: admins } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'admin');
      const list = (admins || []) as Array<{ id: string; full_name?: string }>;
      if (list.length > 0) {
        const rows = list.map((a) => ({
          user_id: a.id,
          title: 'New Demo Request',
          message: `From ${data.name} (${data.institution}) – ${data.email}`,
        }));
        await (supabase as any).from('notifications').insert(rows);
      }
    } catch {}
  },

  async list(): Promise<ContactRequest[]> {
    const { data, error } = await supabase
      .from('contact_requests' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as unknown as ContactRequest[];
    return rows;
  },

  async updateStatus(id: string, status: ContactRequest['status'], note?: string) {
    const updates: any = { status };
    if (typeof note !== 'undefined') {
      updates.decision_note = note;
    }
    if (status === 'accepted' || status === 'rejected' || status === 'closed') {
      updates.decision_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from('contact_requests' as any)
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async sendDecisionEmail(args: { to: string; name: string; decision: 'accepted' | 'rejected'; note?: string }) {
    const subject = args.decision === 'accepted'
      ? 'Your demo request has been accepted'
      : 'Regarding your demo request';
    const greeting = `Hi ${args.name},`;
    const bodyAccepted = `Thanks for your interest in Student Leave Central. We'd love to give you a quick walkthrough. Let us know a suitable time.\n\n${args.note ? 'Note: ' + args.note + '\n\n' : ''}Regards,\nAdmin Team`;
    const bodyRejected = `Thanks for your interest in Student Leave Central. At the moment, we won't be proceeding with a demo.\n\n${args.note ? 'Note: ' + args.note + '\n\n' : ''}Regards,\nAdmin Team`;
    const text = `${greeting}\n\n${args.decision === 'accepted' ? bodyAccepted : bodyRejected}`;
    const html = `<p>${greeting}</p><p>${(args.decision === 'accepted' ? bodyAccepted : bodyRejected).replace(/\n/g,'<br/>')}</p>`;
    // Invoke Supabase Edge Function (send-email)
    const { error } = await (supabase as any).functions.invoke('send-email', {
      body: { to: args.to, subject, text, html },
    });
    if (error) throw error;
  },
};
