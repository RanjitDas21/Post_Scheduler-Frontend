import { useEffect } from "react";
import { CalendarClock, Send, Users, TrendingUp, Sparkles, Link2, Unlink, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useDashboardStore } from "../store/dashboardStore.js";
import { useAuthStore } from "../store/authStore.js";

const activityIcon = {
  published: Send,
  scheduled: CalendarClock,
  connected: Link2,
  disconnected: Unlink,
  ai_generated: Sparkles,
  failed: AlertTriangle,
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const StatCard = ({ label, value, hint, icon: Icon, tint }) => (
  <div className="bg-white rounded-xl2 border border-cream-200 p-6 flex-1">
    <div className="flex items-start justify-between mb-4">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${tint}1A` }}
      >
        <Icon size={18} style={{ color: tint }} />
      </div>
      {hint && (
        <span className="text-xs font-medium text-sage-600 flex items-center gap-1">
          <TrendingUp size={12} /> {hint}
        </span>
      )}
    </div>
    <p className="text-3xl font-display font-semibold text-ink">{value}</p>
    <p className="text-sm text-ink-muted mt-1">{label}</p>
  </div>
);

const DashboardHome = () => {
  const user = useAuthStore((s) => s.user);
  const { stats, recentActivity, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Manage and automate your social presence" />

      <div className="p-8">
        <h2 className="font-display text-2xl font-semibold mb-1">Good to see you, {firstName} 👋</h2>
        <p className="text-ink-muted mb-7">Here's what's happening with your accounts today.</p>

        {loading || !stats ? (
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl2 bg-cream-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Scheduled posts"
              value={stats.scheduledPosts}
              hint={stats.scheduledToday ? `+${stats.scheduledToday} today` : null}
              icon={CalendarClock}
              tint="#BF4E2E"
            />
            <StatCard
              label="Published posts"
              value={stats.publishedPosts}
              hint="All time"
              icon={Send}
              tint="#46705B"
            />
            <StatCard
              label="Connected accounts"
              value={stats.connectedAccounts}
              hint={stats.connectedAccounts ? "Active" : null}
              icon={Users}
              tint="#D18F35"
            />
          </div>
        )}

        <div className="bg-white rounded-xl2 border border-cream-200 p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-ink">Recent activity</h3>
            {!loading && <span className="text-xs text-ink-muted">{recentActivity.length} events</span>}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-ink-muted text-sm">
                Nothing here yet — connect an account or schedule your first post to get started.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-cream-200">
              {recentActivity.map((activity) => {
                const Icon = activityIcon[activity.type] || Send;
                return (
                  <li key={activity._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="h-9 w-9 rounded-full bg-cream-100 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-ink-light" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-light capitalize">{activity.type.replace("_", " ")}</p>
                      <p className="text-sm text-ink truncate">{activity.message}</p>
                    </div>
                    <span className="text-xs text-ink-muted shrink-0">{timeAgo(activity.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
