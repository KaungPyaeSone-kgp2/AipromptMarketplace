import React from "react";
import { Navigate, Route, Routes, useOutletContext } from "react-router";
import UserLayout from "./layouts/UserLayout.jsx";
import BuyerRating from "./pages/BuyerRating.jsx";
import CreatorHome from "./pages/CreatorHome.jsx";
import CreatorRating from "./pages/CreatorRating.jsx";
import CreatorProfile from "./pages/CreatorProfile.jsx";
import Followings from "./pages/Followings.jsx";
import PurchasedPrompt from "./pages/PurchasedPrompt.jsx";
import PromptDetail from "./pages/PromptDetail.jsx";
import UserHome from "./pages/UserHome.jsx";

function CreatorOnly({ children }) {
  const { isCreatorMode } = useOutletContext();

  if (!isCreatorMode) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<UserHome />} />
        <Route path="purchased" element={<PurchasedPrompt />} />
        <Route path="followings" element={<Followings />} />
        <Route path="prompt/:promptId" element={<PromptDetail />} />
        <Route path="creator/:creatorId" element={<CreatorProfile />} />
        <Route path="rating/buyer" element={<BuyerRating />} />

        <Route
          path="rating/creator"
          element={
            <CreatorOnly>
              <CreatorRating />
            </CreatorOnly>
          }
        />

        <Route
          path="creator"
          element={
            <CreatorOnly>
              <CreatorHome />
            </CreatorOnly>
          }
        />

        {/* Legacy redirects */}
        <Route path="community" element={<Navigate to="/followings" replace />} />
        <Route path="favorites" element={<Navigate to="/rating/buyer" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
