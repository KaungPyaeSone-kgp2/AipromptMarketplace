import React from "react";
import { Navigate, Route, Routes, useOutletContext } from "react-router";
import UserLayout from "./layouts/UserLayout.jsx";
import BuyerRating from "./pages/BuyerRating.jsx";
import Community from "./pages/Community.jsx";
import CreatorHome from "./pages/CreatorHome.jsx";
import CreatorRating from "./pages/CreatorRating.jsx";
import Favorites from "./pages/Favorites.jsx";
import PurchasedPrompt from "./pages/PurchasedPrompt.jsx";
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
        <Route path="community" element={<Community />} />
        <Route path="favorites" element={<Favorites />} />
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
