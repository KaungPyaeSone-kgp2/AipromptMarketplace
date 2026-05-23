import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import PromptCard from "../components/PromptCard.jsx";
import { fetchHomePrompts } from "../services/promptService.js";
import { fetchCreatorById } from "../services/userService.js";

function formatJoinedDate(value) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCreatorProfile() {
      setLoading(true);

      try {
        const [profile, allPrompts] = await Promise.all([
          fetchCreatorById(creatorId).catch(() => null),
          fetchHomePrompts(),
        ]);

        if (cancelled) return;

        setCreatorProfile(profile);
        setPrompts(
          allPrompts.filter((p) => String(p.creatorId) === String(creatorId))
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCreatorProfile();

    return () => {
      cancelled = true;
    };
  }, [creatorId]);

  const creator = useMemo(() => {
    const firstPrompt = prompts[0] ?? null;

    if (!creatorProfile && !firstPrompt) return null;

    return {
      id: creatorId,
      name:
        creatorProfile?.displayName ??
        firstPrompt?.creatorName ??
        firstPrompt?.creator ??
        "Creator",
      avatarUrl: creatorProfile?.avatarUrl ?? firstPrompt?.creatorAvatarUrl,
      description:
        creatorProfile?.creatorBio ||
        firstPrompt?.description ||
        "This creator has not added a profile description yet.",
      followingCount: creatorProfile?.followingCount ?? 0,
      followersCount: creatorProfile?.followersCount ?? 0,
      postedPromptCount: creatorProfile?.postedPromptCount || prompts.length,
      joinedAt: creatorProfile?.joinedAt ?? null,
    };
  }, [creatorId, creatorProfile, prompts]);

  if (loading) {
    return (
      <div className="glass-panel p-10 text-center text-sm text-slate-400">
        Loading creator profile...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-sm text-slate-400">Creator not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-violet-300">
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
                className="h-24 w-24 rounded-full border-4 border-slate-950 object-cover ring-4 ring-violet-500/30"
              />
              <div className="pb-1">
                <p className="text-xs font-black uppercase tracking-widest text-violet-300">
                  Creator account
                </p>
                <h1 className="mt-1 text-2xl font-black text-white">
                  {creator.name}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFollowing((prev) => !prev)}
              className={`h-10 rounded-xl px-5 text-sm font-black transition ${
                isFollowing
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "bg-white text-slate-950 hover:bg-violet-100"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-300">
            {creator.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="font-black text-white">
                {creator.followingCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-400">Following</span>
            </div>
            <div>
              <span className="font-black text-white">
                {creator.followersCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-400">Followers</span>
            </div>
            <div>
              <span className="font-black text-white">
                {creator.postedPromptCount.toLocaleString()}
              </span>
              <span className="ml-1 text-slate-400">Prompt posts</span>
            </div>
            <div>
              <span className="text-slate-400">Joined: </span>
              <span className="font-black text-white">
                {formatJoinedDate(creator.joinedAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} variant="grid" />
        ))}
      </div>
    </div>
  );
}
