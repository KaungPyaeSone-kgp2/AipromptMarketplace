import React, { useState } from "react";
import { Link } from "react-router";
import { useShop } from "../../context/ShopContext.jsx";
import {
  BellIcon,
  CartIcon,
  ExchangeIcon,
  HeartIcon,
  LogoIcon,
  MagicIcon,
  SearchIcon,
} from "../Icon.jsx";
import CartPanel from "../shop/CartPanel.jsx";
import WishlistPanel from "../shop/WishlistPanel.jsx";
import NavIconButton from "./NavIconButton.jsx";
import ProfileMenu from "./ProfileMenu.jsx";

export default function Navbar({
  user,
  notificationCount = 0,
  searchQuery = "",
  onSearchChange,
  isCreatorMode = false,
  onSwitchToCreator,
  onSignOut,
}) {
  const { cartUnseenCount, wishlistUnseenCount, markCartSeen, markWishlistSeen } =
    useShop();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const openCart = () => {
    setWishlistOpen(false);
    setCartOpen(true);
    markCartSeen();
  };

  const openWishlist = () => {
    setCartOpen(false);
    setWishlistOpen(true);
    markWishlistSeen();
  };

  return (
    <nav
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-700/30 px-4 backdrop-blur-xl"
      style={{ background: "rgba(8, 13, 28, 0.96)" }}
    >
      <Link to="/" className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
          <LogoIcon />
        </div>
        <span className="text-lg font-black tracking-tight text-white">
          PromptAI
        </span>
      </Link>

      <div className="relative ml-2 max-w-xl flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search prompts, styles, models..."
          className="h-11 w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 pl-10 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {!isCreatorMode && (
          <button
            type="button"
            onClick={onSwitchToCreator}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-violet-500/35 bg-violet-600 px-4 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
          >
            <MagicIcon />
            <span className="hidden sm:inline">Creator Mode</span>
          </button>
        )}

        <div className="relative">
          <NavIconButton
            badge={wishlistUnseenCount}
            badgeVariant="violet"
            label="Wishlist"
            onClick={openWishlist}
          >
            <HeartIcon className="h-5 w-5" />
          </NavIconButton>
          <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
        </div>

        <div className="relative">
          <NavIconButton
            badge={cartUnseenCount}
            badgeVariant="blue"
            label="Cart"
            onClick={openCart}
          >
            <CartIcon />
          </NavIconButton>
          <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>

        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-xl px-3 text-xs font-black text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline-flex"
        >
          <ExchangeIcon />
          Exchange
        </button>

        <NavIconButton badge={notificationCount} label="Notifications">
          <BellIcon />
        </NavIconButton>

        {user && <ProfileMenu user={user} onSignOut={onSignOut} onOpenWishlist={openWishlist} />}
      </div>
    </nav>
  );
}
