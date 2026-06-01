import React from "react";
import {
  CommunityIcon,
  CreatorIcon,
  DashboardIcon,
  HomeIcon,
  LibraryIcon,
} from "../Icon.jsx";
import SidebarItem from "./SidebarItem.jsx";
import SidebarRatingMenu from "./SidebarRatingMenu.jsx";

export default function Sidebar({
  libraryCount = 0,
  isCreatorMode = false,
  buyerRatingCount = 0,
  creatorRatingCount = 0,
}) {
  return (
    <aside
      className="sticky top-16 z-50 flex h-[calc(100vh-4rem)] w-16 shrink-0 flex-col items-center gap-2 overflow-visible border-r border-slate-700/30 px-2 py-4"
      style={{
        background: "rgba(8, 13, 28, 0.96)",
      }}
    >
      <SidebarItem to="/" end icon={<HomeIcon />} label="Home" />

      <SidebarItem
        to="/purchased"
        icon={<LibraryIcon />}
        label="Library"
        badgeCount={libraryCount}
        badgeVariant="blue"
      />

      <SidebarItem
        to="/followings"
        icon={<CommunityIcon />}
        label="Followings"
      />

      <SidebarRatingMenu
        isCreatorMode={isCreatorMode}
        buyerRatingCount={buyerRatingCount}
        creatorRatingCount={creatorRatingCount}
      />

      {isCreatorMode && (
        <>
          <div className="my-1 w-8 border-t border-slate-700/70" />
          <SidebarItem
            to="/creator/creatordashboard"
            icon={<DashboardIcon />}
            label="Dashboard"
          />
          <SidebarItem
            to="/creator"
            end
            icon={<CreatorIcon />}
            label="Creator Home"
          />
        </>
      )}
    </aside>
  );
}
