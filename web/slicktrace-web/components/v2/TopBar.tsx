"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Map", href: "/v2" },
  { label: "Incidents", href: "/incidents" },
  { label: "Detection", href: "/detection" },
  { label: "Method", href: "/method" },
];

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="paper h-[52px] shrink-0 border-b border-line bg-surfaceRaised flex items-center px-4 gap-7 z-30">
      <div className="flex items-center gap-1.5 shrink-0">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8.5" stroke="#2B5D8C" strokeWidth="1.4" />
          <path
            d="M4.5 11.2c1.6 1.4 3.3 1.4 5 0s3.4-1.4 5 0"
            stroke="#2B5D8C"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="10" cy="8.3" r="1.3" fill="#B5722A" />
        </svg>
        <span className="text-[14px] font-medium tracking-tight text-ink">
          SlickTrace
        </span>
      </div>

      <nav className="flex items-center gap-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] transition-colors ${
                active ? "text-ink font-medium" : "text-inkMuted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="relative w-64">
        <Search
          size={13}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-inkFaint"
          strokeWidth={1.8}
        />
        <input
          type="text"
          placeholder="Search vessel, MMSI, location or incident…"
          className="w-full h-7 rounded-sm bg-surface pl-7 pr-2.5 text-[12px] text-ink placeholder:text-inkFaint outline-none focus:bg-surfaceRaised focus:ring-1 focus:ring-line transition-colors"
        />
      </div>
    </header>
  );
}
