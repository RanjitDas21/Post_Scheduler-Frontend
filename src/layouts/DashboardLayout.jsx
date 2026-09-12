import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Users, CalendarClock, Wand2, LogOut, Repeat } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/dashboard/accounts", label: "Accounts", icon: Users },
  { to: "/dashboard/scheduler", label: "Scheduler", icon: CalendarClock },
  { to: "/dashboard/ai-composer", label: "AI Composer", icon: Wand2 },
];

const DashboardLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 shrink-0 bg-white border-r border-cream-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-6">
            <div className="h-8 w-8 rounded-lg bg-rust flex items-center justify-center">
              <Repeat size={17} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold">Loop</span>
          </div>

          <p className="px-6 text-xs uppercase tracking-wide text-ink-muted mb-2">Menu</p>
          <nav className="px-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-rust-50 text-rust-600"
                      : "text-ink-light hover:bg-cream-100"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-4 py-5 border-t border-cream-200">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
              style={{ backgroundColor: user?.avatarColor || "#BF4E2E" }}
            >
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-ink-light hover:text-rust-600 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
