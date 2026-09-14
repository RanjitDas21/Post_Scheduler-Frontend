import { useEffect, useRef, useState } from "react";
import { CalendarClock, Send, ImagePlus, ArrowRight, X, Pencil, Ban, RotateCcw, ExternalLink, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PlatformIcon, { PLATFORMS } from "../components/PlatformIcon.jsx";
import { useAccountsStore } from "../store/accountsStore.js";
import { usePostsStore } from "../store/postsStore.js";

const MAX_CHARS = 2000;
const ACCEPT = "image/*,video/*";

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const statusMeta = {
  scheduled: ["Scheduled", "bg-cream-100 text-ink-light"],
  publishing: ["Publishing", "bg-sage-50 text-sage-600"],
  published: ["Published", "bg-sage-50 text-sage-600"],
  partial: ["Partially published", "bg-amber-50 text-amber-700"],
  failed: ["Failed", "bg-rust-50 text-rust-700"],
  cancelled: ["Cancelled", "bg-cream-100 text-ink-muted"],
};

const StatusBadge = ({ status }) => {
  const [label, cls] = statusMeta[status] || [status, "bg-cream-100 text-ink-muted"];
  return <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${cls}`}>{label}</span>;
};

const PostCard = ({
  post,
  onEdit,
  onCancel,
  onPublish,
  onRetry,
  busy
}) => (
  <li className="border border-cream-200 rounded-lg p-3.5">
    <div className="flex items-center gap-2 mb-2">
      <div className="flex gap-1">
        {post.platforms.map((p) => (
          <PlatformIcon
            key={p}
            platform={p}
            size={14}
          />
        ))}
      </div>

      <StatusBadge status={post.status} />

      <span className="text-xs text-ink-muted ml-auto">
        {formatDateTime(post.scheduledAt)}
      </span>
    </div>

    <p className="text-sm text-ink-light whitespace-pre-line line-clamp-3">
      {post.content}
    </p>

    {post.lastError && (
      <p className="text-xs text-rust-600 mt-2 flex gap-1">
        <AlertCircle
          size={13}
          className="shrink-0 mt-0.5"
        />
        {post.lastError}
      </p>
    )}

    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-200">
      {post.status === "scheduled" && (
        <button
          disabled={busy}
          onClick={() => onEdit(post)}
          className="text-xs font-medium text-ink-light hover:text-rust-600 inline-flex items-center gap-1"
        >
          <Pencil size={13} /> Edit
        </button>
      )}

      {["scheduled", "publishing"].includes(post.status) && (
        <button
          disabled={busy}
          onClick={() => onPublish(post._id)}
          className="text-xs font-medium text-ink-light hover:text-rust-600 inline-flex items-center gap-1"
        >
          <Send size={13} /> Publish now
        </button>
      )}

      {["scheduled", "publishing"].includes(post.status) && (
        <button
          disabled={busy}
          onClick={() => onCancel(post._id)}
          className="text-xs font-medium text-ink-light hover:text-rust-600 inline-flex items-center gap-1"
        >
          <Ban size={13} /> Cancel
        </button>
      )}

      {["failed", "partial"].includes(post.status) && (
        <button
          disabled={busy}
          onClick={() => onRetry(post._id)}
          className="text-xs font-medium text-ink-light hover:text-rust-600 inline-flex items-center gap-1"
        >
          <RotateCcw size={13} /> Retry
        </button>
      )}

      {post.zernioResults?.some((r) => r.platformPostUrl) && (
        <a
          href={
            post.zernioResults.find((r) => r.platformPostUrl)?.platformPostUrl
          }
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-ink-light hover:text-rust-600 inline-flex items-center gap-1 ml-auto"
        >
          <ExternalLink size={13} /> View
        </a>
      )}
    </div>
  </li>
);

const SchedulerPage = () => {
  const { accounts, fetchAccounts } = useAccountsStore();
  const { upcoming, published, partial, failed, fetchPosts, createPost, updatePost, cancelPost, publishNow, retryPost } = usePostsStore();
  const connectedPlatforms = [...new Set(accounts.filter((a) => a.status === "connected").map((a) => a.platform))];

  const [platforms, setPlatforms] = useState([]);
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchAccounts(); fetchPosts(); }, [fetchAccounts, fetchPosts]);

  const flash = (message) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };
  const togglePlatform = (p) => setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return setError("Media must be 25 MB or smaller.");
    setError("");
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setContent(""); setPlatforms([]); setMediaFile(null); setMediaPreview(null); setDate(""); setTime("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!content.trim()) return setError("Write something to share first.");
    if (!platforms.length) return setError("Pick at least one platform");
    console.log(platforms.length)
    if (!date || !time) return setError("Choose a date and time.");
    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) return setError("That date and time isn't valid.");
    if (scheduledAt.getTime() <= Date.now() + 30_000) return setError("Choose a time at least a minute from now.");

    const formData = new FormData();
    formData.append("content", content.trim());
    platforms.forEach((p) => formData.append("platforms", p));
    formData.append("scheduledAt", scheduledAt.toISOString());
    formData.append("timezone", timezone);
    if (mediaFile) formData.append("media", mediaFile);

    // // Check FormData contents
    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    setSubmitting(true);
    try { await createPost(formData); resetForm(); flash("Post scheduled successfully."); }
    // catch (err) { setError(err.response?.data?.message || "Couldn't schedule that post."); }
    catch (err) {
      console.error("SCHEDULER ERROR:", err);
      console.error("SCHEDULER RESPONSE:", err.response?.data);
      console.error("SCHEDULER STATUS:", err.response?.status);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Couldn't schedule that post."
      );
    }
    finally { setSubmitting(false); }
  };

  const action = async (id, fn, success) => {
    setBusyId(id); setError("");
    try { await fn(id); flash(success); }
    catch (err) { setError(err.response?.data?.message || "That action failed. Please try again."); }
    finally { setBusyId(null); }
  };

  const openEdit = (post) => {
    const d = new Date(post.scheduledAt);
    setEditing(post); setContent(post.content); setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`); setTimezone(post.timezone || timezone);
  };

  const saveEdit = async () => {
    if (!editing || !content.trim() || !date || !time) return setError("Content, date and time are required.");
    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) return setError("That date and time isn't valid.");
    setBusyId(editing._id); setError("");
    try { await updatePost(editing._id, { content: content.trim(), scheduledAt: scheduledAt.toISOString(), timezone }); setEditing(null); resetForm(); flash("Post updated."); }
    catch (err) { setError(err.response?.data?.message || "Couldn't update that post."); }
    finally { setBusyId(null); }
  };

return (
  <div>
    <PageHeader
      title="Post scheduler"
      subtitle="Create, schedule, publish and manage your posts"
      action={
        toast ? (
          <span className="text-sm text-sage-600 bg-sage-50 px-3 py-2 rounded-full">
            {toast}
          </span>
        ) : null
      }
    />

    <div className="p-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl2 border border-cream-200 p-6 h-fit"
      >
        <h3 className="font-semibold text-ink mb-5">
          {editing ? "Edit scheduled post" : "Compose post"}
        </h3>

        <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
          Platforms
        </p>

        <div className="flex items-center gap-2 mb-5">
          {Object.keys(PLATFORMS).map((p) => {
            const connected = connectedPlatforms.includes(p);
            const selected =
              platforms.includes(p) ||
              (editing?.platforms || []).includes(p);

            return (
              <button
                type="button"
                key={p}
                disabled={!connected || !!editing}
                title={
                  connected
                    ? PLATFORMS[p].label
                    : `Connect ${PLATFORMS[p].label} first`
                }
                onClick={() => togglePlatform(p)}
                className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
                  selected
                    ? "bg-rust-50 border-rust-400"
                    : "border-cream-200"
                } ${
                  !connected ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <PlatformIcon platform={p} size={17} />
              </button>
            );
          })}
        </div>

        <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
          Content
        </p>

        <textarea
          value={content}
          maxLength={MAX_CHARS}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to share today?"
          rows={6}
          className="w-full bg-cream-100 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rust/40 mb-1"
        />

        <p className="text-right text-xs text-ink-muted mb-4">
          {content.length}/{MAX_CHARS}
        </p>

        {!editing && (
          <>
            <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
              Media (optional)
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept={ACCEPT}
              onChange={handleFile}
              className="hidden"
            />

            {mediaPreview ? (
              <div className="relative mb-5">
                {mediaFile?.type.startsWith("video/") ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-48 object-contain rounded-lg bg-ink"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Upload preview"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-ink/70 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border border-dashed border-cream-200 rounded-lg py-6 mb-5 text-ink-muted hover:border-rust-200 hover:text-rust-600 transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-sm">
                  Click to upload image or video
                </span>
                <span className="text-xs">Max 25 MB</span>
              </button>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
              Date
            </p>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-cream-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
              Time
            </p>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-cream-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
            />
          </div>
        </div>

        <p className="text-xs text-ink-muted mb-5">
          Timezone: {timezone}
        </p>

        {error && (
          <p className="text-sm text-rust-600 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type={editing ? "button" : "submit"}
            onClick={editing ? saveEdit : undefined}
            disabled={submitting || busyId === editing?._id}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-rust text-white text-sm font-medium py-3.5 rounded-full hover:bg-rust-600 disabled:opacity-60"
          >
            {editing
              ? busyId === editing._id
                ? "Saving…"
                : "Save changes"
              : submitting
                ? "Scheduling…"
                : "Schedule post"}
            <ArrowRight size={16} />
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                resetForm();
                setError("");
              }}
              className="px-5 py-3.5 rounded-full border border-cream-200 text-sm font-medium"
            >
              Close
            </button>
          )}
        </div>
      </form>

      <div className="space-y-6">
        {/* Upcoming Posts */}
        <section className="bg-white rounded-xl2 border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} />
              <h3 className="font-semibold">Upcoming</h3>
            </div>

            <span className="text-xs text-ink-muted">
              {upcoming.length}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center">
              No posts scheduled yet
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={openEdit}
                  onCancel={(id) =>
                    action(id, cancelPost, "Post cancelled.")
                  }
                  onPublish={(id) =>
                    action(id, publishNow, "Post is being published.")
                  }
                  onRetry={(id) =>
                    action(id, retryPost, "Retry started.")
                  }
                  busy={busyId === post._id}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Needs Attention */}
        {(partial.length || failed.length) > 0 && (
          <section className="bg-white rounded-xl2 border border-cream-200 p-6">
            <h3 className="font-semibold mb-4">
              Needs attention
            </h3>

            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {[...partial, ...failed].map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={openEdit}
                  onCancel={(id) =>
                    action(id, cancelPost, "Post cancelled.")
                  }
                  onPublish={(id) =>
                    action(id, publishNow, "Post is being published.")
                  }
                  onRetry={(id) =>
                    action(id, retryPost, "Retry started.")
                  }
                  busy={busyId === post._id}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Published Posts */}
        <section className="bg-white rounded-xl2 border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send size={15} />
              <h3 className="font-semibold">Published</h3>
            </div>

            <span className="text-xs text-ink-muted">
              {published.length}
            </span>
          </div>

          {published.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center">
              Nothing published yet
            </p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {published.map((post) => (
                <li
                  key={post._id}
                  className="flex items-start gap-3 border-b border-cream-200 pb-3 last:border-0"
                >
                  {/* Platform Icons */}
                  <div className="flex gap-1 pt-0.5">
                    {post.platforms.map((platform) => (
                      <PlatformIcon
                        key={platform}
                        platform={platform}
                        size={14}
                      />
                    ))}
                  </div>

                  {/* Post Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={post.status} />

                      <span className="text-xs text-ink-muted">
                        {formatDateTime(
                          post.publishedAt || post.scheduledAt
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-ink-light line-clamp-2 mt-1">
                      {post.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  </div>
);
};

export default SchedulerPage;
