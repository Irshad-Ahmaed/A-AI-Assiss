import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/" },
  { title: "Departments", href: "/departments" },
  { title: "Rooms", href: "/rooms" },
  { title: "Courses", href: "/courses" },
  { title: "Faculty", href: "/faculty" },
  { title: "Ingestion", href: "/ingestion" },
] as const;

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <div className="sticky top-3 sm:top-6 z-50 w-full px-3 sm:px-4">
      <div className="mx-auto w-full max-w-280">
        <div className="flex items-center justify-between gap-4 rounded-full bg-white pl-4 pr-2 py-2 sm:pl-5 sm:py-2.5 shadow-sm border border-line">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span
              aria-label="Anugat AI"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-deep to-brand-blue text-white font-extrabold text-[14px] shadow-sm select-none"
            >
              A
            </span>
            <span className="font-extrabold tracking-[-0.02em] text-ink text-[15px] sm:text-[16px] whitespace-nowrap">
              Anugat AI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-[14px] transition-colors whitespace-nowrap",
                  isActive(item.href)
                    ? "text-ink font-bold"
                    : "text-ink-soft font-semibold hover:text-ink"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            {/* Mobile/tablet hamburger */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-sm active:scale-95 transition"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet sheet */}
        {open && (
          <div className="lg:hidden mt-2 rounded-card border border-line bg-white shadow-md p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[15px] transition-colors",
                    isActive(item.href)
                      ? "bg-canvas-2 text-ink font-bold"
                      : "text-ink-soft font-semibold hover:bg-canvas-2/60"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
