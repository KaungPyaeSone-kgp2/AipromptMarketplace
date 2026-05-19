import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import PromptCard from "../components/PromptCard.jsx";
import { fetchCreatorPrompts } from "../services/promptService.js";
import { fetchFollowingPosts } from "../services/followingService.js";

export default function Followings() {
  const { isCreatorMode } = useOutletContext() ?? {};
  const [followingPosts, setFollowingPosts] = useState([]);
  const [myPostedPrompts, setMyPostedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("feed");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const feed = await fetchFollowingPosts();
      setFollowingPosts(feed);

      if (isCreatorMode) {
        const posted = await fetchCreatorPrompts();
        setMyPostedPrompts(posted);
      }

      setLoading(false);
    }

    load();
  }, [isCreatorMode]);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-lg font-black text-white">Followings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Prompt posts from creators you follow.
        </p>
      </div>

      {isCreatorMode && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("feed")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === "feed"
                ? "bg-violet-600 text-white"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800"
            }`}
          >
            Following feed
          </button>
          <button
            type="button"
            onClick={() => setTab("my-posts")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === "my-posts"
                ? "bg-violet-600 text-white"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800"
            }`}
          >
            My posted prompts
          </button>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          Loading...
        </div>
      ) : tab === "my-posts" && isCreatorMode ? (
        myPostedPrompts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {myPostedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                actionLabel="View post"
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center text-sm text-slate-400">
            You have not posted any prompts yet.
          </div>
        )
      ) : followingPosts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {followingPosts.map((post) => (
            <PromptCard
              key={post.id}
              prompt={{
                ...post,
                creator: post.creatorName,
              }}
              actionLabel="View post"
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          Follow creators to see their prompt posts here.
        </div>
      )}
    </div>
  );
}

