import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { contactService } from '@/services/contactService';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    const payload = {
      name,
      email,
      institution,
      message,
      source: 'contact_page',
      ts: new Date().toISOString(),
    };

    try {
      // 0) Persist to DB table for admin review
      await contactService.submit({ name, email, institution, message });

      // 1) Optional webhook
      const webhook = import.meta.env.VITE_CONTACT_WEBHOOK_URL as string | undefined;
      if (webhook) {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      }

      // 2) Log into Supabase audit_logs for traceability
      try {
        await supabase.from('audit_logs' as any).insert({
          action: 'contact_request',
          entity_type: 'contact',
          details: payload,
        } as any);
      } catch (_) {
        // Best-effort logging
      }

  setSubmitted(true);
  setName('');
  setEmail('');
  setInstitution('');
  setMessage('');
  // Show success briefly, then redirect to home
  setTimeout(() => navigate('/', { replace: true }), 1800);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 text-slate-900 dark:text-slate-100 transition-all duration-500 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-indigo-300/20 dark:from-blue-600/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/20 dark:from-purple-600/20 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Theme toggle */}
      <button
        aria-label="Toggle theme"
        className="absolute top-4 right-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow hover:shadow-md transition"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        {theme === 'light' ? <Moon className="h-5 w-5 text-slate-700" /> : <Sun className="h-5 w-5 text-yellow-300" />}
      </button>

      <main className="flex items-center justify-center flex-1 px-4 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Request a Demo</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tell us a bit about your institution and we’ll get in touch to schedule a quick walkthrough.
            </p>

            {submitted && (
              <div className="mb-4 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-3 text-sm">
                Thanks! Your request has been sent. Redirecting to home…
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg h-11 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg h-11 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg h-11 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Share any specific needs, timelines, or questions."
                  disabled={loading}
                  className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-60"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Send Request</span>
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">
              Your details will be sent securely to our backend. We also record a log for follow-up. No emails are opened on your device.
            </p>
          </div>
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Leave Management System. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
