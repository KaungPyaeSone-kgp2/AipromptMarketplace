import React from "react";
import {
  CommunityIcon,
  CreatorIcon,
  DashboardIcon,
  HomeIcon,
  LibraryIcon,
  FlagIcon,
  MagicIcon,
} from "../Icon.jsx";
import SidebarItem from "./SidebarItem.jsx";
import SidebarRatingMenu from "./SidebarRatingMenu.jsx";

export default function Sidebar({
  buyerRatingCount = 0,
  creatorRatingCount = 0,
  reportCount = 0,
}) {
  return (
    <aside
      className="sticky top-16 z-50 flex h-[calc(100vh-4rem)] w-16 shrink-0 flex-col items-center gap-2 overflow-visible border-r border-gray-200 dark:border-slate-700/30 px-2 py-4 bg-white/90 dark:bg-[#080d1c]/95 transition-colors duration-200"
    >
      <SidebarItem to="/user" end icon={<HomeIcon />} label="Home" />
      <SidebarItem to="/user/created-prompts" icon={<MagicIcon />} label="Shared Prompts" />


      {/* <SidebarItem
        to="/purchased"
        icon={<LibraryIcon />}
        label="Library"
        badgeCount={libraryCount}
        badgeVariant="blue"
      /> */}

      <SidebarItem
        to="/user/followings"
        icon={<CommunityIcon />}
        label="Followings"
      />

      <SidebarItem
        to="/user/reports"
        icon={<FlagIcon />}
        label="Reports"
        badgeCount={reportCount}
        badgeVariant="rose"
      />

      <SidebarRatingMenu
        buyerRatingCount={buyerRatingCount}
        creatorRatingCount={creatorRatingCount}
      />


    </aside>
  );
}
