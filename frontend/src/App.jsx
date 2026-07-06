// import DreamKeyLoader from "./loading/DreamKeyLoader";

// function App() {
//   return <DreamKeyLoader />;
// }

// export default App;

// App.jsx

// import AdminLayout from "./admin/layout/AdminLayout";

// export default function App() {
//   return (
//     <AdminLayout>
//       <h1 className="text-3xl font-bold">Dashboard</h1>
//     </AdminLayout>
//   );
// }

//-----------------------------------------------------------------------------------

// //src/App.jsx
// import { useState } from "react";
// import AdminLayout from "./admin/layout/AdminLayout";

// //Seamless batch import from your barrel file
// import {
//   Dashboard,
//   UserManagement,
//   PromptManagement,
//   CategoryManagement,
//   UserToUser,
//   AdminToUser,
//   UserReport,
//   PromptReport,
// } from "./admin/pages";

// export default function App() {
//   const [activeItem, setActiveItem] = useState("Dashboard");

//   // Conditional rendering helper to choose the correct separated page file
//   const renderPage = () => {
//     switch (activeItem) {
//       case "Dashboard":
//         return <Dashboard />;
//       case "User":
//         return <UserManagement />;
//       case "Prompt":
//         return <PromptManagement />;
//       case "Category":
//         return <CategoryManagement />;
//       case "User to User":
//         return <UserToUser />;
//       case "Admin to User":
//         return <AdminToUser />;
//       case "User Report":
//         return <UserReport />;
//       case "Prompt Report":
//         return <PromptReport />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <AdminLayout activeItem={activeItem} setActiveItem={setActiveItem}>
//       {renderPage()}
//     </AdminLayout>
//   );
// }

//-----------------------------------------------------------------------------------

// src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

// HOME Section Import
import Home from "./home/Home";
import Login from "./login_register/Login";
import Register from "./login_register/Register";
import VerifyOtp from "./login_register/VerifyOtp";
import ForgotPassword from "./login_register/ForgotPassword";
import ResetPassword from "./login_register/ResetPassword";
import Explore from "./home/Explore";
import Faq from "./home/components/FAQ";
import Contact from "./home/components/Contact";
import Privacy from "./home/components/Privacy";
import Terms from "./home/components/Terms";
import ProtectedRoute from "./admin/components/ProtectedRoute";

// Seamless batch import from your barrel file
import {
  Dashboard,
  UserManagement,
  PromptManagement,
  CategoryManagement,
  UserToUser,
  AdminToUser,
  UserReport,
  PromptReport,
  BadReviewReport,
} from "./admin/pages";

import AdminLayout from "./admin/layout/AdminLayout";

// USER Section Imports
import UserLayout from "./users/layouts/UserLayout";
import UserHome from "./users/pages/UserHome";
import CreatePrompt from "./users/pages/CreatePrompt";
import Followings from "./users/pages/Followings";
import UserReports from "./users/pages/UserReports";
import RatingGive from "./users/pages/RatingGive";
import RatingReceive from "./users/pages/RatingReceive";
import PromptDetail from "./users/pages/PromptDetail";
import CreatorProfile from "./users/pages/CreatorProfile";
import ProfileSettings from "./users/pages/ProfileSettings";
import PurchasedPrompt from "./users/pages/PurchasedPrompt";
import FullPromptContent from "./users/pages/FullPromptContent";


import CreatedPrompts from "./users/pages/CreatedPrompts";

// Create a small wrapper wrapper for Admin panel management
function AdminDashboardWrapper() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const renderPage = () => {
    switch (activeItem) {
      case "Dashboard":
        return <Dashboard />;
      case "User":
        return <UserManagement />;
      case "Prompt":
        return <PromptManagement />;
      case "Category":
        return <CategoryManagement />;
      case "User to User":
        return <UserToUser />;
      case "Admin to User":
        return <AdminToUser />;
      case "User Report":
        return <UserReport />;
      case "Prompt Report":
        return <PromptReport />;
      case "Bad Review":
        return <BadReviewReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeItem={activeItem} setActiveItem={setActiveItem}>
      {renderPage()}
    </AdminLayout>
  );
}

import { ShopProvider } from "./users/context/ShopContext.jsx";

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/explore" element={<Explore />} />

          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* ADMIN ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardWrapper />} />
          </Route>

          {/* USER ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserHome />} />
              <Route path="created-prompts" element={<CreatedPrompts />} />
              <Route path="createpost" element={<CreatePrompt />} />
              <Route path="createpost/:promptId" element={<CreatePrompt />} />
              <Route path="followings" element={<Followings />} />
              <Route path="reports" element={<UserReports />} />
              <Route path="rating" element={<RatingGive />} />
              <Route path="ratingreceive" element={<RatingReceive />} />
              <Route path="prompt/:id" element={<PromptDetail />} />
              <Route path="prompt/:id/content" element={<FullPromptContent />} />
              <Route path="profile/:id" element={<CreatorProfile />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="purchased" element={<PurchasedPrompt />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ShopProvider>
  );
}
