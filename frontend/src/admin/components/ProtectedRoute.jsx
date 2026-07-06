// src/components/ProtectedRoute.jsx
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        // const response = await fetch(
        //   "http://localhost:8000/backend/api/check_session.php",
        //   {
        //     method: "POST",
        //     credentials: "include", // This sends the PHP session cookie!
        //   },
        // );

        const response = await fetch(
          "/api/login_register/get_current_user.php",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (data.success) {
          // Save the current user ID for the frontend layout/services to use
          sessionStorage.setItem("promptai_user_id", data.user.id);

          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            user: {
              ...data.user,
              role: data.user.user_role // Map user_role to role for ProtectedRoute checks
            },
          });
        } else {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
        }
      } catch (error) {
        setAuthState({ isLoading: false, isAuthenticated: false, user: null });
      }
    };

    verifySession();
  }, []);

  // Cinematic Loading Screen while checking credentials
  if (authState.isLoading) {
    return (
      <div className="bg-black text-white h-screen w-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-orange-500 border-r-transparent border-b-purple-600 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  // Kick to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kick to normal dashboard if they are logged in, but aren't an Admin trying to access an Admin page
  if (allowedRoles.length > 0 && !allowedRoles.includes(authState.user.role)) {
    return <Navigate to="/user" replace />;
  }

  // If they pass all checks, render the protected component!
  return <Outlet context={{ user: authState.user }} />;
}
