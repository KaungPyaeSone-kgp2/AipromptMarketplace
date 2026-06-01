import { Navigate, Route, Routes, useOutletContext } from "react-router";
import UserLayout from "./users/layouts/UserLayout.jsx";
import BuyerRating from "./users/pages/BuyerRating.jsx";
import CreatorHome from "./users/pages/CreatorHome.jsx";
import CreatorRating from "./users/pages/CreatorRating.jsx";
import CreatorProfile from "./users/pages/CreatorProfile.jsx";
import Followings from "./users/pages/Followings.jsx";
import PurchasedPrompt from "./users/pages/PurchasedPrompt.jsx";
import PromptDetail from "./users/pages/PromptDetail.jsx";
import ProfileSettings from "./users/pages/ProfileSettings.jsx";
import UserHome from "./users/pages/UserHome.jsx";
import CreatePrompt from "./users/pages/CreatePrompt.jsx";
import FullPromptContent from "./users/pages/FullPromptContent.jsx";
import CreatorDashboard from "./users/pages/CreatorDashboard.jsx";

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
        <Route path="prompt/:promptId/full" element={<FullPromptContent />} />
        <Route path="creator/:creatorId" element={<CreatorProfile />} />
        <Route path="user/:userId" element={<CreatorProfile />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
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

        <Route
          path="creator/creatordashboard"
          element={
            <CreatorOnly>
              <CreatorDashboard />
            </CreatorOnly>
          }
        />

        <Route
          path="creator/promptcreate"
          element={
            <CreatorOnly>
              <CreatePrompt />
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
