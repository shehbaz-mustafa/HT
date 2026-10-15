import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | HT Ledger',
  description: 'Terms and Conditions of Service for HT Ledger.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[--bg] text-[--fg] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-[--surface] p-8 md:p-12 rounded-lg border border-border shadow-sm">
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <span className="label">Legal Record</span>
            <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight">Terms and Conditions</h1>
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
            <h2 className="text-lg font-serif font-bold text-[--fg]">1. Acceptance of Terms</h2>
            <p className="text-[--secondary]">
              By accessing or using the HT Ledger application, you agree to be bound by these Terms and Conditions. If you do not agree with any provision of these terms, you must refrain from using the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">2. Nature of Service</h2>
            <p className="text-[--secondary]">
              HT Ledger provides personal task scheduling, habit continuity tracking, and ledger analytics. The service is provided on an as-available basis for personal and professional productivity management.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">3. Account Responsibilities and Security</h2>
            <p className="text-[--secondary]">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your ledger. You agree to notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">4. Acceptable Use Standards</h2>
            <p className="text-[--secondary]">
              You agree not to misuse the service, interfere with infrastructure operations, reverse engineer server components, or attempt unauthorized access to other user data partitions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">5. Limitation of Liability and Disclaimers</h2>
            <p className="text-[--secondary]">
              To the fullest extent permitted by applicable law, HT Ledger and its maintainers shall not be liable for any indirect, incidental, consequential, or punitive damages arising from the use of, or inability to use, the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">6. Termination and Data Export</h2>
            <p className="text-[--secondary]">
              You may discontinue use of the service at any time. Before terminating your ledger, you are encouraged to export your data in JSON or CSV format via the application settings interface.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[--fg]">7. Governing Law and Amendments</h2>
            <p className="text-[--secondary]">
              These terms shall be governed by and construed in accordance with applicable governing jurisdiction principles. We reserve the right to amend these terms by posting updated terms directly to this page.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-[--secondary]">
          <span>HT Ledger Legal Governance</span>
          <Link href="/privacy" className="text-[--accent] hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
