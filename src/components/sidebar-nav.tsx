'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/today', label: 'Today' },
  { href: '/habits', label: 'Habits' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' },
];

export function SidebarNav({ recordDate }: { recordDate: string }) {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-44 flex-col border-r border-[--border] bg-[--surface]">
      <div className="px-5 pt-6 pb-2">
        <span className="text-xl font-bold tracking-tight">HT</span>
      </div>
      <nav className="mt-4 flex flex-col gap-0.5 px-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded px-3 py-1.5 text-sm transition-colors ${
              path === l.href || (l.href !== '/' && path.startsWith(l.href))
                ? 'bg-[--muted] font-semibold text-[--fg]'
                : 'text-[--secondary] hover:bg-[--muted] hover:text-[--fg]'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-5 pb-6">
        <p className="label">Ledger Record</p>
        <p className="mt-1 font-mono text-xs text-[--secondary]">{recordDate}</p>
      </div>
    </aside>
  );
}

