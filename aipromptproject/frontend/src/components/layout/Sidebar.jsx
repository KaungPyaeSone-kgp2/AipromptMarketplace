import React from "react";
import {
  CommunityIcon,
  CreatorIcon,
  HomeIcon,
  LibraryIcon,
  StarIcon,
} from "../Icon.jsx";
import SidebarItem from "./SidebarItem.jsx";

export default function Sidebar({
  libraryCount = 0,
  isCreatorMode = false,
}) {
  return (
    <aside
      className="relative flex w-16 shrink-0 flex-col items-center gap-2 border-r border-slate-700/30 px-2 py-4"
      style={{
        minHeight: "calc(100vh - 4rem)",
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
        to="/community"
        icon={<CommunityIcon />}
        label="Community"
      />

      <SidebarItem
        to="/favorites"
        icon={<StarIcon />}
        label="Favorites"
      />

      {isCreatorMode && (
        <>
          <div className="my-1 w-8 border-t border-slate-700/70" />
          <SidebarItem
            to="/creator"
            icon={<CreatorIcon />}
            label="Creator Home"
          />
        </>
      )}
    </aside>
  );
}
