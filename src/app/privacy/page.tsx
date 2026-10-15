import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | HT Ledger',
  description: 'Privacy Policy and data governance standards for HT Ledger.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[--bg] text-[--fg] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-[--surface] p-8 md:p-12 rounded-lg border border-border shadow-sm">
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <span className="label">Legal Record</span>
            <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight">Privacy Policy</h1>
            <p className="mt-1 font-mono text-xs text-[--secondary]">Effective Date: October 15, 2026</p>
          </div>
          <Link
            href="/today"
            className="rounded border border-border px-3 py-1.5 text-xs font-semibold hover:bg-[--muted] transition-colors"
          >
            Back to Ledger
          </Link>
        </div>

        <div className="space-y-6 text-sm text-[--fg] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">1. Data Philosophy and Local Ownership</h2>
            <p className="text-[--secondary]">
              HT Ledger is engineered with an emphasis on data sovereignty and minimal remote footprint. You retain complete ownership of all tasks, habit protocols, check-in timestamps, reflections, and personal metrics logged within the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">2. Information Collected and Stored</h2>
            <p className="text-[--secondary]">
              We only process data necessary to provide habit and task tracking functionality:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[--secondary] pl-2">
              <li><strong>Account Credentials:</strong> Email address and encrypted authentication tokens when an account is established.</li>
              <li><strong>Ledger Records:</strong> Task titles, descriptions, due dates, habit schedules, check-in logs, and numerical progress values.</li>
              <li><strong>Client Preferences:</strong> Interface theme, week start preference, timezone designation, and reminder notification configuration.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">3. Storage and Data Transmission</h2>
            <p className="text-[--secondary]">
              When utilizing local or guest mode, records persist directly in your browser client storage. When using cloud synchronization with an authenticated account, data is transmitted via Transport Layer Security (TLS) and stored in isolated database schemas secured by Row Level Security (RLS) policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">4. Third-Party Disclosures and Tracking</h2>
            <p className="text-[--secondary]">
              We do not sell, rent, monetize, or disclose your personal records to third-party data brokers or advertisers. We do not embed surveillance tracking pixels, invasive session recording scripts, or behavioral advertising networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">5. Data Portability and Erasure</h2>
            <p className="text-[--secondary]">
              You may export a full machine-readable JSON backup or CSV exports of tasks and habits at any time through the application settings. You may also execute an irrevocable erasure of all stored records directly within the interface.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">6. Policy Inquiries</h2>
            <p className="text-[--secondary]">
              For questions concerning this Privacy Policy or your data rights, contact privacy@ht-ledger.internal.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-[--secondary]">
          <span>HT Ledger Legal Governance</span>
          <Link href="/terms" className="text-[--accent] hover:underline">
            Terms and Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
