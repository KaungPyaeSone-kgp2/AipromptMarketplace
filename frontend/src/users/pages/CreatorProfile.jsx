import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PromptCard from "../components/PromptCard.jsx";
import ReportButton from "../components/ReportButton.jsx";
import {
  fetchFollowerAccounts,
  fetchFollowingAccounts,
  fetchFollowStatus,
  getCurrentFollowerId,
  toggleFollowCreator,
  FOLLOW_COUNTS_UPDATED_EVENT
} from "../services/followService.js";
import {
  fetchProfilePrompts,
  PROMPTS_UPDATED_EVENT,
} from "../services/promptService.js";
import { fetchCreatorById, fetchUserById } from "../services/userService.js";

function formatJoinedDate(value) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function ConnectionListModal({
  title,
  type,
  accounts,
  loading,
  onClose,
  onOpenAccount,
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-400 dark:border-slate-700 bg-[#070814] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 px-5 py-4">
          <h2 className="text-base font-black text-violet-700 dark:text-violet-300">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-black text-slate-600 dark:text-slate-400 transition hover:bg-violet-300 hover:text-slate-950"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Loading accounts...
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => onOpenAccount(account)}
                  className="group flex w-full items-center gap-3 rounded-xl p-3 text-left text-slate-700 dark:text-slate-300 transition hover:bg-violet-500/20 hover:text-violet-300 hover:ring-1 hover:ring-violet-500/35"
                >
                  <img
                    src={account.avatarUrl}
                    alt={account.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{account.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition group-hover:text-violet-200/80">
                      {account.isCreator
                        ? `${account.postedPromptCount.toLocaleString()} prompt posts`
                        : `${account.followingCount.toLocaleString()} following`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              No accounts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatorProfile() {
  const navigate = useNavigate();
  const { creatorId, userId, id } = useParams();
  const profileUserId = creatorId ?? userId ?? id;
  const isUserProfileRoute = Boolean(userId ?? id);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [connectionModal, setConnectionModal] = useState(null);
  const [connectionAccounts, setConnectionAccounts] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const isOwnProfile = String(getCurrentFollowerId()) === String(profileUserId);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);

    async function loadCreatorProfile() {
      setLoading(true);

      try {
        const [profile, followingAccounts] = await Promise.all([
          isUserProfileRoute
            ? fetchUserById(profileUserId).catch(() => fetchCreatorById(profileUserId).catch(() => null))
            : fetchCreatorById(profileUserId).catch(() => fetchUserById(profileUserId).catch(() => null)),
          fetchFollowingAccounts().catch(() => []),
        ]);

        if (cancelled) return;

        const followingIds = followingAccounts.map((a) => a.id);
        const profilePrompts = await fetchProfilePrompts(profileUserId, followingIds);

        setCreatorProfile(profile);
        setPrompts(profilePrompts);

        if (!isOwnProfile) {
          const followStatus = await fetchFollowStatus(profileUserId).catch(() => false);
          if (!cancelled) setIsFollowing(followStatus);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const handlePromptsUpdated = () => {
      loadCreatorProfile();
    };

    const handleFollowCountsUpdated = (event) => {
      const followersCount = event.detail?.followersCount;
      if (typeof followersCount === "number" && isOwnProfile) {
        setCreatorProfile((currentProfile) =>
          currentProfile ? { ...currentProfile, followersCount } : currentProfile
        );
      }
    };

    loadCreatorProfile();
    window.addEventListener(PROMPTS_UPDATED_EVENT, handlePromptsUpdated);
    window.addEventListener(FOLLOW_COUNTS_UPDATED_EVENT, handleFollowCountsUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(PROMPTS_UPDATED_EVENT, handlePromptsUpdated);
      window.removeEventListener(FOLLOW_COUNTS_UPDATED_EVENT, handleFollowCountsUpdated);
    };
  }, [profileUserId, isOwnProfile, isUserProfileRoute]);

  const creator = useMemo(() => {
    const firstPrompt = prompts[0] ?? null;

    if (!creatorProfile && !firstPrompt) return null;

    return {
      id: profileUserId,
      isCreator: Boolean(creatorProfile?.isCreator),
      name:
        creatorProfile?.displayName ??
        firstPrompt?.creatorName ??
        firstPrompt?.creator ??
        "Creator",
      avatarUrl: creatorProfile?.avatarUrl ?? firstPrompt?.creatorAvatarUrl,
      description:
        creatorProfile?.creatorBio ||
        (creatorProfile?.isCreator
          ? "This creator has not added a profile description yet."
          : "This user has not added a profile description yet."),
      followingCount: creatorProfile?.followingCount ?? 0,
      followersCount: creatorProfile?.followersCount ?? 0,
      postedPromptCount: creatorProfile?.postedPromptCount || prompts.length,
      purchasedPromptsCount: creatorProfile?.purchasedPromptsCount ?? 0,
      joinedAt: creatorProfile?.joinedAt ?? null,
    };
  }, [profileUserId, creatorProfile, prompts]);

  const handleToggleFollow = async () => {
    setFollowLoading(true);

    try {
      const response = await toggleFollowCreator(profileUserId);
      const isNowFollowing = Boolean(response?.is_following);

      setIsFollowing(isNowFollowing);
      setCreatorProfile((currentProfile) =>
        currentProfile
          ? {
            ...currentProfile,
            followersCount: Number(response?.followers_count ?? currentProfile.followersCount ?? 0),
          }
          : currentProfile
      );

      // Instantly update the list of visible prompts to show/hide "followers_only" posts
      const followingIds = isNowFollowing ? [profileUserId] : [];
      const profilePrompts = await fetchProfilePrompts(profileUserId, followingIds);
      setPrompts(profilePrompts);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenConnections = async (type) => {
    const title = type === "followers" ? "Followers" : "Following";

    setConnectionModal({ type, title });
    setConnectionAccounts([]);
    setConnectionLoading(true);

    try {
      const accounts =
        type === "followers"
          ? await fetchFollowerAccounts(profileUserId)
          : await fetchFollowingAccounts(profileUserId);

      setConnectionAccounts(accounts);
    } catch (error) {
      console.error("Failed to load connection list", error);
      setConnectionAccounts([]);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleOpenAccount = (account) => {
    setConnectionModal(null);
    navigate(`/user/profile/${account.id}`);
  };

  if (loading) {
    return (
      <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
        Loading creator profile...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">Creator not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-violet-700 dark:text-violet-300">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <section className="surface-strong overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-500 sm:h-36" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <img
                src={creator.avatarUrl}
                alt={creator.name}
                className="h-24 w-24 rounded-full border-4 border-slate-950 object-cover ring-4 ring-violet-500/50 dark:ring-violet-500/30"
              />
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {creator.name}
                </h1>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`h-10 rounded-xl px-5 text-sm font-black transition ${isFollowing
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-700"
                    : "bg-white text-slate-950 hover:bg-violet-100"
                    }`}
                >
                  {followLoading ? "Saving..." : isFollowing ? "Following" : "Follow"}
                </button>
                <ReportButton
                  targetType="user"
                  targetId={creator.id}
                />
              </div>
            )}
          </div>

          <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-700 dark:text-slate-300">
            {creator.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <button
              type="button"
              onClick={() => handleOpenConnections("following")}
              className="rounded-lg text-left transition hover:text-violet-300"
            >
              <span className="font-black text-slate-900 dark:text-white">
                {creator.followingCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-600 dark:text-slate-400">Following</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenConnections("followers")}
              className="rounded-lg text-left transition hover:text-violet-300"
            >
              <span className="font-black text-slate-900 dark:text-white">
                {creator.followersCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-600 dark:text-slate-400">Followers</span>
            </button>
            <div>
              <span className="font-black text-slate-900 dark:text-white">
                {creator.postedPromptCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-600 dark:text-slate-400">Prompt posts</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Joined: </span>
              <span className="font-black text-slate-900 dark:text-white">
                {formatJoinedDate(creator.joinedAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} variant="grid" showVisibilityInfo={true} />
        ))}
      </div>

      {connectionModal && (
        <ConnectionListModal
          title={connectionModal.title}
          type={connectionModal.type}
          accounts={connectionAccounts}
          loading={connectionLoading}
          onClose={() => setConnectionModal(null)}
          onOpenAccount={handleOpenAccount}
        />
      )}
    </div>
  );
}
