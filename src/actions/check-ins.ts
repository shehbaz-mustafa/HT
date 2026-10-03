'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Input = z.object({ habitId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), checked: z.boolean() });

export async function toggleCheckIn(input: unknown): Promise<{ error?: string }> {
  const p = Input.safeParse(input);
  if (!p.success) return { error: 'Invalid request.' };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };
  const { habitId, date, checked } = p.data;
  const { error } = checked
    ? await supabase.from('check_ins').upsert({ habit_id: habitId, user_id: user.id, date }, { onConflict: 'habit_id,date', ignoreDuplicates: true })
    : await supabase.from('check_ins').delete().eq('habit_id', habitId).eq('date', date);
  if (error) return { error: 'Could not save. Try again.' };
  revalidatePath('/today');
  return {};
}

