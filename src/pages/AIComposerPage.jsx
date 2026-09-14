import { useEffect, useState } from "react";
import { Wand2, Clock, ArrowRight, Image as ImageIcon } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Modal from "../components/Modal.jsx";
import PlatformIcon, { PLATFORMS } from "../components/PlatformIcon.jsx";
import { useAIStore } from "../store/aiStore.js";
import { useAccountsStore } from "../store/accountsStore.js";
import { usePostsStore } from "../store/postsStore.js";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const AIComposerPage = () => {
  const { generations, generating, fetchGenerations, generate } = useAIStore();
  const { accounts, fetchAccounts } = useAccountsStore();
  const connectedPlatforms = [...new Set(accounts.filter((a) => a.status === "connected").map((a) => a.platform))];

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [scheduling, setScheduling] = useState(null); // generation being scheduled

  useEffect(() => {
    fetchGenerations();
    fetchAccounts();
  }, [fetchGenerations, fetchAccounts]);

  const handleGenerate = async (e) => {
  e.preventDefault();
  setError("");

  if (!prompt.trim()) {
    return setError(
      "Please describe the image you want to generate."
    );
  }

  try {
    await generate({
      prompt,
    });

    setPrompt("");
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Image generation failed. Please try again."
    );
  }
};

  return (
    <div>
      <PageHeader title="AI Composer" subtitle="Manage and automate your social presence" />

      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-semibold text-center mb-7">
          What should we create today?
        </h2>

        <form onSubmit={handleGenerate} className="bg-white rounded-xl2 border border-cream-200 p-2 mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a post about launching a new Next.js course"
            rows={2}
            className="w-full p-4 text-sm resize-none focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-rust-700 transition-colors disabled:opacity-60"
            >
              {generating ? "Generating…" : "Generate"}
              {!generating && <ArrowRight size={15} />}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-rust-600 mb-4 text-center">{error}</p>}

        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-ink-light" />
          <h3 className="font-semibold text-ink">Recent generations</h3>
          <span className="text-xs text-ink-muted ml-auto">{generations.length} total</span>
        </div>

        {generating && (
          <div className="bg-white rounded-xl2 border border-cream-200 p-5 mb-4 animate-pulse">
            <div className="h-4 bg-cream-100 rounded w-1/3 mb-3" />
            <div className="h-3 bg-cream-100 rounded w-full mb-2" />
            <div className="h-3 bg-cream-100 rounded w-5/6" />
          </div>
        )}

        <div className="space-y-3">
          {generations.length === 0 && !generating && (
            <p className="text-sm text-ink-muted text-center py-10">
              Nothing generated yet — describe a post above to get started.
            </p>
          )}
          {generations.map((g) => (
            <div key={g._id} className="bg-white rounded-xl2 border border-cream-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">{timeAgo(g.createdAt)}</span>
                </div>
                <button
                  onClick={() => setScheduling(g)}
                  className="text-sm font-medium text-ink-light hover:text-rust-600 transition-colors"
                >
                  Use this →
                </button>
              </div>
              <div className="flex gap-4">
                {g.imageUrl && (
                  <img src={g.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover shrink-0" />
                )}
                <p className="text-sm text-ink-light whitespace-pre-line line-clamp-4">{g.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {scheduling && (
        <ScheduleGenerationModal
          generation={scheduling}
          connectedPlatforms={connectedPlatforms}
          onClose={() => setScheduling(null)}
          onScheduled={() => setScheduling(null)}
        />
      )}
    </div>
  );
};

const ScheduleGenerationModal = ({ generation, connectedPlatforms, onClose, onScheduled }) => {
  const createPost = usePostsStore((s) => s.createPost);
  const [platforms, setPlatforms] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (p) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleSchedule = async () => {
    setError("");
    if (!platforms.length) return setError("Pick at least one channel.");
    if (!date || !time) return setError("Choose a date and time.");

    const scheduledAt = new Date(`${date}T${time}`);
    const formData = new FormData();
    formData.append("content", generation.caption);
    platforms.forEach((p) => formData.append("platforms", p));
    if (Number.isNaN(scheduledAt.getTime())) return setError("That date and time isn't valid.");
    if (scheduledAt.getTime() <= Date.now() + 30_000) return setError("Choose a time at least a minute from now.");
    formData.append("scheduledAt", scheduledAt.toISOString());
    formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    formData.append("source", "ai");
    if (generation.imageUrl) {
      formData.append("mediaUrl", generation.imageUrl);
      formData.append("mediaType", "image");
    }

    setSubmitting(true);
    try {
      await createPost(formData);
      onScheduled();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't schedule this post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Schedule generation" onClose={onClose}>
      {generation.imageUrl ? (
        <img src={generation.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
      ) : (
        <div className="w-full h-32 bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-ink-muted">
          <ImageIcon size={22} />
        </div>
      )}
      <p className="text-sm text-ink-light mb-5 line-clamp-3">{generation.caption}</p>

      <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">Select channels</p>
      <div className="flex items-center gap-2 mb-5">
        {Object.keys(PLATFORMS).map((p) => {
          const isConnected = connectedPlatforms.includes(p);
          const isSelected = platforms.includes(p);
          return (
            <button
              key={p}
              type="button"
              disabled={!isConnected}
              onClick={() => togglePlatform(p)}
              className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
                isSelected ? "bg-rust-50 border-rust-400" : "border-cream-200"
              } ${!isConnected ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <PlatformIcon platform={p} size={17} />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-cream-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-cream-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
        />
      </div>

      {error && <p className="text-sm text-rust-600 mb-4">{error}</p>}

      <button
        onClick={handleSchedule}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-rust text-white text-sm font-medium py-3 rounded-full hover:bg-rust-600 transition-colors disabled:opacity-60"
      >
        <Wand2 size={15} />
        {submitting ? "Scheduling…" : "Schedule post"}
      </button>
    </Modal>
  );
};

export default AIComposerPage;
