import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { ChevronIcon } from "../Icon.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";
import {
  fetchFollowerAccounts,
  fetchFollowingAccounts,
} from "../../services/followService.js";

function ConnectionListPopup({
  title,
  type,
  accounts,
  loading,
  emptyMessage,
  onClose,
  onOpenAccount,
}) {
  return (
    <div
      id="connection-list-popup"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#070814] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-base font-black text-violet-300">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-black text-slate-400 transition hover:bg-violet-300 hover:text-slate-950"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Loading following list...
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => onOpenAccount(account)}
                  className="group flex w-full items-center gap-3 rounded-xl p-3 text-left text-slate-300 transition hover:bg-violet-500/20 hover:text-violet-300 hover:ring-1 hover:ring-violet-500/35"
                >
                  <img
                    src={account.avatarUrl}
                    alt={account.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-500/35"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{account.name}</p>
                    <p className="text-xs text-slate-400 transition group-hover:text-violet-200/80">
                      {account.isCreator
                        ? `${account.postedPromptCount.toLocaleString()} prompt posts`
                        : `${account.followingCount.toLocaleString()} following`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-400">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileMenu({ user, onSignOut, onOpenWishlist }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [connectionModal, setConnectionModal] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionAccounts, setConnectionAccounts] = useState([]);
  const ref = useRef(null);
  const points = Number(user.points ?? 0);

  useOutsideClick(ref, (event) => {
    if (document.getElementById("connection-list-popup")?.contains(event.target)) {
      return;
    }
    setOpen(false);
    setConnectionModal(null);
  });

  const handleOpenConnections = async (type) => {
    const title = type === "followers" ? "Followers" : "Following";

    setConnectionModal({ type, title });
    setConnectionLoading(true);
    setConnectionAccounts([]);

    try {
      const accounts =
        type === "followers"
          ? await fetchFollowerAccounts(user.id)
          : await fetchFollowingAccounts(user.id);

      setConnectionAccounts(accounts);
    } catch (error) {
      console.error(`Failed to load ${type} accounts`, error);
      setConnectionAccounts([]);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleOpenAccount = (account) => {
    setConnectionModal(null);
    setOpen(false);
    navigate(account.isCreator ? `/creator/${account.id}` : `/user/${account.id}`);
};

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-2xl border border-transparent p-1 pr-2 transition hover:border-slate-700/80 hover:bg-slate-800/60"
      >
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/35"
        />
        <span className="hidden text-sm font-bold text-white sm:block">
          {user.displayName}
        </span>
        <span className="hidden sm:block">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
          <Link
            to={user.isCreator ? `/creator/${user.id}` : `/user/${user.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-b border-slate-700/80 px-4 py-3 transition hover:bg-violet-500/10 group"
          >
            <div className="relative shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/35 transition group-hover:ring-violet-400"
              />
              <span className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 text-[8px] text-white font-bold">View</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white transition group-hover:text-violet-300">
                {user.fullName ?? user.displayName}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <p className="mt-1 text-xs font-bold text-emerald-300">
                {points.toLocaleString()} coin
              </p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-2 border-b border-slate-700/80 px-4 py-3">
            {user.isCreator ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenConnections("followers")}
                  className="group rounded-lg p-1 text-left text-slate-300 transition hover:bg-violet-500/20 hover:text-violet-300 hover:ring-1 hover:ring-violet-500/35"
                >
                  <p className="text-[11px] font-bold uppercase text-slate-500 transition group-hover:text-violet-200/80">
                    Followers
                  </p>
                  <p className="text-sm font-black">
                    {(user.followersCount ?? 0).toLocaleString()}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenConnections("following")}
                  className="group rounded-lg p-1 text-left text-slate-300 transition hover:bg-violet-500/20 hover:text-violet-300 hover:ring-1 hover:ring-violet-500/35"
                >
                  <p className="text-[11px] font-bold uppercase text-slate-500 transition group-hover:text-violet-200/80">
                    Following
                  </p>
                  <p className="text-sm font-black">
                    {(user.followingCount ?? 0).toLocaleString()}
                  </p>
                </button>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Posts
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.postedPromptCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Sales
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.totalSalesCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Earned
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.totalEarningCoins ?? 0).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenConnections("following")}
                  className="group rounded-lg p-1 text-left text-slate-300 transition hover:bg-violet-500/20 hover:text-violet-300 hover:ring-1 hover:ring-violet-500/35"
                >
                  <p className="text-[11px] font-bold uppercase text-slate-500 transition group-hover:text-violet-200/80">
                    Following
                  </p>
                  <p className="text-sm font-black">
                    {(user.followingCount ?? 0).toLocaleString()}
                  </p>
                </button>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Purchased
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.purchasedPromptsCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>

          {user.isCreator && (
            <Link
              to="/creator/creatordashboard"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/settings/profile"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenWishlist?.();
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Exchange History
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut?.();
            }}
            className="w-full border-t border-slate-700/80 px-4 py-2.5 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
          >
            Sign out
          </button>
        </div>
      )}

      {connectionModal
        ? createPortal(
            <ConnectionListPopup
              title={connectionModal.title}
              type={connectionModal.type}
              accounts={connectionAccounts}
              loading={connectionLoading}
              emptyMessage={`No ${connectionModal.type} accounts found.`}
              onClose={() => {
                setConnectionModal(null);
                setOpen(false);
              }}
              onOpenAccount={handleOpenAccount}
            />,
            document.body
          )
        : null}
    </div>
  );
}
