import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Modal from "../components/Modal.jsx";
import PlatformIcon, { PLATFORMS } from "../components/PlatformIcon.jsx";
import { useAccountsStore } from "../store/accountsStore.js";

const platformCopy = {
  twitter: "Post tweets, threads, and media",
  linkedin: "Share updates and articles",
  facebook: "Manage your pages and profile",
  instagram: "Share photos, reels and stories",
};

const AccountsPage = () => {
  const { accounts, platforms, loading, fetchAccounts, connectAccount, disconnectAccount } =
    useAccountsStore();
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Zernio redirects the browser back to /dashboard/accounts?connected=<platform>
  // (or ?error=...) once the OAuth approval step finishes.
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      setToast(`${PLATFORMS[connected]?.label || connected} connected`);
      fetchAccounts(true);
    } else if (error === "connection_cancelled") {
      setToast("Connection cancelled — nothing was connected.");
    } else if (error) {
      setToast("Something went wrong connecting that account.");
    }
    if (connected || error) {
      setSearchParams({}, { replace: true });
      setTimeout(() => setToast(""), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleConnect = async (platform) => {
    setConnecting(platform);
    try {
      const result = await connectAccount(platform);
      if (!result.redirecting) {
        setShowModal(false);
        setToast(`${PLATFORMS[platform].label} connected`);
        setTimeout(() => setToast(""), 3000);
      }
      // If redirecting, the browser is about to navigate away entirely —
      // nothing left to update here.
    } catch (err) {
      setToast(err.response?.data?.message || "Couldn't connect that account.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id) => {
    setBusyId(id);
    try {
      await disconnectAccount(id);
      setToast("Account disconnected");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || "Couldn't disconnect that account.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setBusyId(null);
    }
  };

  const connectedCount = accounts.filter((a) => a.status === "connected").length;

  return (
    <div>
      <PageHeader
        title="Social accounts"
        subtitle="Manage and automate your social presence"
        action={
          toast ? (
            <span className="text-sm text-sage-600 bg-sage-50 px-3 py-2 rounded-full">{toast}</span>
          ) : null
        }
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-ink text-lg">Connected accounts</h2>
            <p className="text-sm text-ink-muted mt-0.5">
              {connectedCount} connected account{connectedCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-rust text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-rust-600 transition-colors"
          >
            <Plus size={16} />
            Connect account
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 rounded-xl2 bg-cream-100 animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-dashed border-cream-200 p-12 text-center">
            <p className="text-ink-muted text-sm mb-4">
              No accounts connected yet. Connect one to start scheduling posts.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-4 py-2.5 rounded-full"
            >
              <Plus size={15} /> Connect your first account
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="bg-white rounded-xl2 border border-cream-200 p-5 flex items-center gap-4"
              >
                <div className="h-11 w-11 rounded-full bg-cream-100 flex items-center justify-center shrink-0">
                  <PlatformIcon platform={account.platform} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{account.displayName}</p>
                  <p className="text-sm text-ink-muted truncate">{PLATFORMS[account.platform]?.label}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${account.status === "connected" ? "text-sage-600" : "text-ink-muted"}`}>
                  <CheckCircle2 size={13} /> {account.status === "connected" ? "Connected" : account.status}
                </span>
                <button
                  disabled={busyId === account._id}
                  onClick={() => handleDisconnect(account._id)}
                  className="text-ink-muted hover:text-rust-600 transition-colors shrink-0 disabled:opacity-50"
                  aria-label={`Disconnect ${account.displayName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Choose a platform" onClose={() => setShowModal(false)}>
          <div className="space-y-2.5">
            {platforms.map(({ platform, label, connected }) => (
              <button
                key={platform}
                disabled={connecting === platform}
                onClick={() => handleConnect(platform)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  connected
                    ? "bg-rust-50 border-rust-100"
                    : "border-cream-200 hover:border-rust-200 hover:bg-cream-100"
                } disabled:cursor-not-allowed`}
              >
                <div className="h-9 w-9 rounded-lg bg-white border border-cream-200 flex items-center justify-center shrink-0">
                  <PlatformIcon platform={platform} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-ink">{label}</p>
                  <p className="text-xs text-ink-muted">
                    {connected ? "Connected · add another account" : platformCopy[platform]}
                  </p>
                </div>
                {connected ? (
                  <span className="text-xs text-sage-600 shrink-0">Add</span>
                ) : connecting === platform ? (
                  <span className="text-xs text-ink-muted shrink-0">Connecting…</span>
                ) : (
                  <ExternalLink size={15} className="text-ink-muted shrink-0" />
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AccountsPage;
