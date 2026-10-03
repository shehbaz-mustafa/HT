// Seeds a demo user with sample habits and ~4 months of history. Run: npm run seed
// Uses the service role key from your local env. Server-side only; never ship it to the browser.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { addDays, isoDow, localDate } from '../src/lib/dates';

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, SEED_EMAIL: email, SEED_PASSWORD: password } = process.env;
if (!url || !key || !email || !password) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_EMAIL and SEED_PASSWORD.');
const tz = 'Asia/Kolkata';
const admin = createClient(url, key, { auth: { persistSession: false } });

let s = 42;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);

async function main() {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: 'Demo', timezone: tz } });
  let id = created.data.user?.id;
  if (!id) {
    const list = await admin.auth.admin.listUsers({ perPage: 1000 });
    id = list.data.users.find((u) => u.email === email)?.id;
  }
  if (!id) throw new Error(`Could not create or find ${email}`);
  await admin.from('habits').delete().eq('user_id', id);
  const defs = [
    { name: 'Read 20 pages', category: 'Intellect', frequency_type: 'daily', days_of_week: [], target_per_period: 1, reminder_time: '07:30', p: 0.85 },
    { name: 'Strength training', category: 'Physical', frequency_type: 'custom', days_of_week: [1, 3, 5], target_per_period: 1, reminder_time: '08:15', p: 0.8 },
    { name: 'Review finances', category: 'Order', frequency_type: 'weekly', days_of_week: [], target_per_period: 1, reminder_time: '12:30', p: 0.9 },
    { name: 'Lights out by 23:00', category: 'Sleep', frequency_type: 'daily', days_of_week: [], target_per_period: 1, reminder_time: '22:30', p: 0.7 },
  ] as const;
  const { data: habits, error } = await admin.from('habits')
    .insert(defs.map(({ p: _p, ...d }, i) => ({ ...d, days_of_week: [...d.days_of_week], user_id: id, position: i }))).select('id,name');
  if (error || !habits) throw error ?? new Error('insert failed');
  const today = localDate(tz);
  const rows: { habit_id: string; user_id: string; date: string }[] = [];
  for (let back = 120; back >= 1; back--) {
    const d = addDays(today, -back);
    defs.forEach((def, i) => {
      const on = def.frequency_type === 'daily' || (def.frequency_type === 'custom' && (def.days_of_week as readonly number[]).includes(isoDow(d))) || (def.frequency_type === 'weekly' && isoDow(d) === 7);
      if (on && rnd() < def.p) rows.push({ habit_id: habits[i].id, user_id: id!, date: d });
    });
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error: e } = await admin.from('check_ins').insert(rows.slice(i, i + 500));
    if (e) throw e;
  }
  console.log(`Seeded ${habits.length} habits and ${rows.length} check-ins for ${email}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
