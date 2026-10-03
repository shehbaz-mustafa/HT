'use client';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { magicLink, signIn, signUp } from '@/actions/auth';
import type { FormState } from '@/lib/types';

const input = 'w-full border border-border bg-surface px-3 py-2 text-sm';
const btn = 'h-9 px-4 bg-accent text-on-accent text-xs font-medium uppercase tracking-wider hover:bg-accent-hover disabled:opacity-60';

function Msg({ s }: { s: FormState }) {
  if (s?.error) return <p role="alert" className="text-sm text-danger">{s.error}</p>;
  if (s?.message) return <p role="status" className="text-sm text-secondary">{s.message}</p>;
  return null;
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [a, act, pa] = useActionState<FormState, FormData>(mode === 'login' ? signIn : signUp, undefined);
  const [m, mAct, pm] = useActionState<FormState, FormData>(magicLink, undefined);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelectorAll<HTMLInputElement>('input[name=timezone]').forEach((i) => (i.value = tz));
  }, []);
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-12">
      <div>
        <span className="font-serif text-3xl">HT</span>
        <h1 className="mt-6 text-2xl">{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      </div>
      <form action={act} className="flex flex-col gap-4">
        <input type="hidden" name="timezone" />
        {mode === 'signup' && (
          <label className="flex flex-col gap-1"><span className="label">Name (optional)</span>
            <input className={input} name="name" maxLength={60} autoComplete="name" /></label>
        )}
        <label className="flex flex-col gap-1"><span className="label">Email</span>
          <input className={input} name="email" type="email" required autoComplete="email" /></label>
        <label className="flex flex-col gap-1"><span className="label">Password</span>
          <input className={input} name="password" type="password" required minLength={8} maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        <Msg s={a} />
        <button className={btn} disabled={pa}>{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <form action={mAct} className="flex flex-col gap-3 border-t border-border pt-6">
        <input type="hidden" name="timezone" />
        <span className="label">Or get a sign-in link by email</span>
        <input className={input} name="email" type="email" required autoComplete="email" aria-label="Email for sign-in link" />
        <Msg s={m} />
        <button className={`${btn} !bg-transparent !text-fg border border-border hover:!bg-muted`} disabled={pm}>Email me a link</button>
      </form>
      <p className="text-sm text-secondary">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <Link className="underline" href={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link>
      </p>
    </div>
  );
}

