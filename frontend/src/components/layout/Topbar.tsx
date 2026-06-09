import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
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
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<{ name: string; email: string; role: string }>({
    queryKey: ["auth", "me"],
    queryFn: () => api.get("/auth/me").then((res) => res.data.user),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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

          <div className="flex items-center gap-3">
            {/* User profile dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-canvas-2 transition text-left focus:outline-hidden cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-deep to-brand-blue text-white font-bold text-sm shadow-sm select-none">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    <div className="px-3 py-2">
                      <div className="font-bold text-ink truncate text-sm">
                        {user.name || "Administrator"}
                      </div>
                      <div className="text-xs text-muted truncate">{user.email}</div>
                      <span className="mt-1.5 inline-flex items-center rounded-md bg-brand-blue/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-brand-deep">
                        {user.role}
                      </span>
                    </div>
                    <div className="h-px bg-line my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5 rounded-lg transition font-semibold cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile/tablet hamburger */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-sm active:scale-95 transition cursor-pointer"
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
