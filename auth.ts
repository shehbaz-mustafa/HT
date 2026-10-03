'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { FormState } from '@/lib/types';

const Email = z.string().trim().email().max(254);
const Password = z.string().min(8).max(72);
const Tz = z.string().max(64).optional();

async function origin() {
  return (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
}
const field = (fd: FormData, k: string) => (fd.get(k) ?? undefined) as string | undefined;

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ email: Email, password: Password }).safeParse({ email: field(fd, 'email'), password: field(fd, 'password') });
  if (!p.success) return { error: 'Enter a valid email and a password of at least 8 characters.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(p.data);
  if (error) return { error: 'Email or password is incorrect.' };
  redirect('/today');
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const p = z
    .object({ email: Email, password: Password, name: z.string().trim().max(60).optional(), timezone: Tz })
    .safeParse({ email: field(fd, 'email'), password: field(fd, 'password'), name: field(fd, 'name'), timezone: field(fd, 'timezone') });
  if (!p.success) return { error: 'Enter a valid email and a password of at least 8 characters.' };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: p.data.email,
    password: p.data.password,
    options: { emailRedirectTo: `${await origin()}/auth/callback`, data: { display_name: p.data.name, timezone: p.data.timezone } },
  });
  if (error) return { error: 'Could not create the account. Try a different email or password.' };
  if (data.session) redirect('/today');
  return { message: 'Check your email to confirm your account.' };
}

export async function magicLink(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ email: Email, timezone: Tz }).safeParse({ email: field(fd, 'email'), timezone: field(fd, 'timezone') });
  if (!p.success) return { error: 'Enter a valid email address.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: p.data.email,
    options: { emailRedirectTo: `${await origin()}/auth/callback`, data: { timezone: p.data.timezone } },
  });
  if (error) return { error: 'Could not send the link. Try again shortly.' };
  return { message: 'Check your email for a sign-in link.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
