'use client';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { demoSignIn, magicLink, signIn, signUp } from '@/actions/auth';
import type { FormState } from '@/lib/types';

/* ── helpers ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Alert({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2.5 text-sm text-[var(--danger)]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {state.error}
    </div>
  );
  if (state.message) return (
    <div role="status" className="flex items-start gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)]/10 px-3 py-2.5 text-sm text-[var(--accent)]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {state.message}
    </div>
  );
  return null;
}

/* ── main component ──────────────────────────────────────────────────────── */
export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<'password' | 'magic'>('password');
  const tzRef = useRef<HTMLInputElement[]>([]);

  const [authState, authAction, authPending] = useActionState<FormState, FormData>(
    mode === 'login' ? signIn : signUp,
    undefined,
  );
  const [magicState, magicAction, magicPending] = useActionState<FormState, FormData>(
    magicLink,
    undefined,
  );

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelectorAll<HTMLInputElement>('input[name=timezone]').forEach((el) => {
      el.value = tz;
    });
  }, []);

  const isLogin = mode === 'login';

  return (
    <div className="flex min-h-screen">
      {/* ── Left decorative panel (hidden on small screens) ── */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-12 shrink-0"
        style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
      >
        <div>
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>HT</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl leading-tight" style={{ color: 'var(--on-accent)', fontFamily: 'Georgia, serif' }}>
            Habit and Task Ledger
          </h2>
          <p className="text-base opacity-80 leading-relaxed" style={{ color: 'var(--on-accent)' }}>
            A structured ledger to track daily protocols, monitor schedule-aware continuity, and schedule tasks.
          </p>
        </div>
        <p className="text-xs opacity-50" style={{ color: 'var(--on-accent)' }}>HT Ledger Record</p>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">

          {/* Header */}
          <div className="space-y-1">
            {/* Mobile logo */}
            <span className="mb-4 block text-2xl font-bold lg:hidden" style={{ fontFamily: 'Georgia, serif' }}>HT</span>
            <h1 className="text-3xl" style={{ color: 'var(--fg)' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--secondary)' }}>
              {isLogin
                ? 'Sign in to access your ledger.'
                : 'Start tracking habits with persistent local and cloud storage.'}
            </p>
          </div>

          {/* Tab switcher (login only) */}
          {isLogin && (
            <div
              className="flex rounded-lg p-1 gap-1"
              style={{ background: 'var(--muted)' }}
            >
              {(['password', 'magic'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 rounded-md py-1.5 text-sm font-medium transition-all"
                  style={
                    tab === t
                      ? { background: 'var(--surface)', color: 'var(--fg)', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                      : { background: 'transparent', color: 'var(--secondary)' }
                  }
                >
                  {t === 'password' ? 'Password' : 'Magic link'}
                </button>
              ))}
            </div>
          )}

          {/* Password form */}
          {(!isLogin || tab === 'password') && (
            <form action={authAction} className="space-y-4">
              <input type="hidden" name="timezone" />

              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="label">Name <span style={{ color: 'var(--secondary)' }}>(optional)</span></label>
                  <input
                    id="name"
                    name="name"
                    className="input-base"
                    maxLength={60}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-base"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">Password</label>
                  {isLogin && (
                    <span className="text-xs" style={{ color: 'var(--secondary)' }}>
                      Min. 8 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={72}
                    className="input-base pr-10"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--secondary)' }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <Alert state={authState} />

              <button type="submit" className="btn-primary" disabled={authPending}>
                {authPending && <Spinner />}
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
          )}

          {/* Magic link form */}
          {isLogin && tab === 'magic' && (
            <form action={magicAction} className="space-y-4">
              <input type="hidden" name="timezone" />
              <div className="space-y-1.5">
                <label htmlFor="magic-email" className="label">Email</label>
                <input
                  id="magic-email"
                  name="email"
                  type="email"
                  required
                  className="input-base"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <Alert state={magicState} />

              <button type="submit" className="btn-primary" disabled={magicPending}>
                {magicPending && <Spinner />}
                Email me a sign-in link
              </button>
            </form>
          )}

          {/* Signup magic link */}
          {!isLogin && (
            <>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--secondary)' }}>or</span>
                <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              </div>
              <form action={magicAction} className="space-y-4">
                <input type="hidden" name="timezone" />
                <div className="space-y-1.5">
                  <label htmlFor="magic-email-signup" className="label">Sign up with magic link</label>
                  <input
                    id="magic-email-signup"
                    name="email"
                    type="email"
                    required
                    className="input-base"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <Alert state={magicState} />
                <button type="submit" className="btn-ghost" disabled={magicPending}>
                  {magicPending && <Spinner />}
                  Email me a link instead
                </button>
              </form>
            </>
          )}

          {/* Demo / Guest Access */}
          <div className="relative flex items-center gap-3 my-1">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--secondary)' }}>or</span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          </div>

          <form action={demoSignIn}>
            <button
              type="submit"
              className="btn-ghost hover:border-[--accent] text-xs font-semibold uppercase tracking-wider"
            >
              Explore Ledger as Guest / Demo
            </button>
          </form>

          {/* Switch mode link */}
          <p className="text-center text-sm" style={{ color: 'var(--secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="font-medium underline underline-offset-2"
              style={{ color: 'var(--accent)' }}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </Link>
          </p>

          {/* Legal links */}
          <div className="pt-4 border-t border-border flex items-center justify-center gap-3 text-xs text-[--secondary]">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>-</span>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
