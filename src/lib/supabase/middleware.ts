import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieList = Parameters<NonNullable<CookieMethodsServer['setAll']>>[0];

const PUBLIC = ['/login', '/signup', '/auth'];

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list: CookieList) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC.some((p) => path === p || path.startsWith(`${p}/`));
  const redirectTo = (to: string) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.search = '';
    const r = NextResponse.redirect(url);
    res.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };
  if (!user && !isPublic) return redirectTo('/login');
  if (user && (path === '/login' || path === '/signup')) return redirectTo('/today');
  if (path === '/') return redirectTo(user ? '/today' : '/login');
  return res;
}

