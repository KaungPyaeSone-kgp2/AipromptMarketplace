// import { useState, useEffect } from "react";
// import { Bell, User, LogOut, X, Mail, Camera } from "lucide-react";
// import { useNavigate } from "react-router";

// export default function Navbar() {
//   const [notificationOpen, setNotificationOpen] = useState(false);
//   const [profilePanelOpen, setProfilePanelOpen] = useState(false);

//   // State to hold the dynamic user data from database
//   const [userData, setUserData] = useState({
//     user_name: "Loading...",
//     user_email: "Loading...",
//     user_role: "user",
//     profile_image: "/uploads/profiles/default-profile-picture-male-icon.svg",
//   });

//   const notifications = [];

//   const navigate = useNavigate();

//   // Fetch live user session data when the navbar mounts
//   useEffect(() => {
//     const fetchUserSession = async () => {
//       try {
//         const response = await fetch(
//           "/api/login_register/get_current_user.php",
//           {
//             method: "GET",
//             credentials: "include",
//           },
//         );
//         const data = await response.json();

//         if (data.success) {
//           setUserData(data.user);
//         } else {
//           console.log("Session invalid:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching user profile:", error);
//       }
//     };

//     fetchUserSession();
//   }, []);

//   const displayRole = userData.user_role === "admin" ? "Admin" : "User";

//   return (
//     <>
//       <nav className="h-[75px] bg-[rgba(17,24,39,0.95)] border-b border-white/10 backdrop-blur-md px-6 flex items-center justify-between relative z-40">
//         {/* Left Side */}
//         <div className="flex items-center gap-3">
//           <div>
//             <h1 className="font-bold text-lg text-white">DreamKey</h1>
//             <p className="text-xs text-gray-400">AI Prompt Library</p>
//           </div>
//         </div>

//         {/* Right Side */}
//         <div className="flex items-center gap-5">
//           {/* Notification */}
//           <div className="relative">
//             <button
//               onClick={() => setNotificationOpen(!notificationOpen)}
//               className="relative p-3 rounded-xl hover:bg-white/10 transition-all text-white"
//             >
//               <Bell size={22} />
//               <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#A78BFA] text-black text-xs flex items-center justify-center font-bold">
//                 0
//               </div>
//             </button>

//             {notificationOpen && (
//               <div className="absolute right-0 mt-3 w-[320px] bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
//                 <h3 className="font-semibold mb-3 text-white">Notifications</h3>
//                 {notifications.length === 0 ? (
//                   <div className="text-gray-400 text-sm">
//                     No notifications yet
//                   </div>
//                 ) : (
//                   <div className="text-white">Notifications Here</div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Profile Trigger Button */}
//           <button
//             onClick={() => setProfilePanelOpen(true)}
//             className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
//           >
//             <img
//               src={userData.profile_image}
//               alt="profile"
//               className="w-10 h-10 rounded-full object-cover border border-white/10"
//               onError={(e) => {
//                 e.target.src =
//                   "/uploads/profiles/default-profile-picture-male-icon.svg";
//               }}
//             />
//             <div className="text-left">
//               <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
//                 {userData.user_name}
//               </h4>
//               <p className="text-xs text-gray-400">{displayRole}</p>
//             </div>
//           </button>
//         </div>
//       </nav>

//       {/* --- RIGHT SIDE PROFILE PANEL --- */}

//       {/* Background Overlay */}
//       {profilePanelOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
//           onClick={() => setProfilePanelOpen(false)}
//         ></div>
//       )}

//       {/* Sliding Panel */}
//       <div
//         className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0F172A]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
//           profilePanelOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         {/* Panel Header */}
//         <div className="flex items-center justify-between p-6 border-b border-white/10">
//           <h2 className="text-xl font-bold text-white tracking-wide">
//             Account Profile
//           </h2>
//           <button
//             onClick={() => setProfilePanelOpen(false)}
//             className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Panel Body */}
//         <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
//           {/* Avatar & Upload Section (UI Only for now) */}
//           <div className="relative group mb-6">
//             <div className="w-32 h-32 rounded-full border-2 border-[#A78BFA]/30 overflow-hidden relative shadow-lg bg-[#1E293B]">
//               <img
//                 src={userData.profile_image}
//                 alt="Large Profile"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.src =
//                     "/uploads/profiles/default-profile-picture-male-icon.svg";
//                 }}
//               />

//               {/* Hover Overlay - Ready for the next step */}
//               <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
//                 <Camera className="text-white mb-1" size={24} />
//                 <span className="text-white text-xs font-semibold">Change</span>
//               </div>
//             </div>
//           </div>

//           <h3 className="text-2xl font-bold text-white mb-1">
//             {userData.user_name}
//           </h3>
//           <span className="px-3 py-1 bg-[#A78BFA]/20 text-[#A78BFA] text-xs font-bold rounded-full uppercase tracking-wider mb-8">
//             {displayRole}
//           </span>

//           {/* User Details */}
//           <div className="w-full space-y-4">
//             <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
//               <div className="p-2 bg-white/10 rounded-lg text-[#A78BFA]">
//                 <User size={20} />
//               </div>
//               <div className="overflow-hidden">
//                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
//                   Username
//                 </p>
//                 <p className="text-white font-semibold truncate">
//                   {userData.user_name}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
//               <div className="p-2 bg-white/10 rounded-lg text-[#A78BFA]">
//                 <Mail size={20} />
//               </div>
//               <div className="overflow-hidden">
//                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
//                   Email
//                 </p>
//                 <p className="text-white font-semibold truncate">
//                   {userData.user_email}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Panel Footer */}
//         <div className="p-6 border-t border-white/10">
//           <button
//             onClick={() => navigate("/")}
//             className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-all font-semibold"
//           >
//             <LogOut size={18} />
//             Sign Out
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

import { useState, useEffect } from "react";
import { User, LogOut, X, Mail, Camera } from "lucide-react";
import { useNavigate } from "react-router";
// Make sure this path correctly points to your DreamKeyLoader file
import DreamKeyLoader from "../../loading/DreamKeyLoader";
import dreamKeyLogo from "../../assets/dream-key-logo.jpg";

export default function Navbar() {
  // const [notificationOpen, setNotificationOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  // New state to control the loading screen visibility
  const [isSigningOut, setIsSigningOut] = useState(false);

  // State to hold the dynamic user data from database
  const [userData, setUserData] = useState({
    user_name: "Loading...",
    user_email: "Loading...",
    user_role: "user",
    profile_image: "/uploads/profiles/default-profile-picture-male-icon.svg",
  });

  // const notifications = [];
  const navigate = useNavigate();

  // Fetch live user session data when the navbar mounts
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch(
          "/api/login_register/get_current_user.php",
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();

        if (data.success) {
          setUserData(data.user);
        } else {
          console.log("Session invalid:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserSession();
  }, []);

  const displayRole = userData.user_role === "admin" ? "Admin" : "User";

  // Handle the sign-out process with the cinematic loader
  const handleSignOut = () => {
    setProfilePanelOpen(false); // Close the side panel
    setIsSigningOut(true); // Show the loader

    // Wait for 3 seconds to let the animation play before routing
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  return (
    <>
      <nav className="h-[75px] bg-[rgba(17,24,39,0.95)] border-b border-white/10 backdrop-blur-md px-6 flex items-center justify-between relative z-40">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <img src={dreamKeyLogo} alt="DreamKey Logo" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h1 className="font-bold text-lg text-white">DreamKey</h1>
            <p className="text-xs text-gray-400">AI Prompt Library</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          {/* Notification */}
          {/* <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-3 rounded-xl hover:bg-white/10 transition-all text-white"
            >
              <Bell size={22} />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#A78BFA] text-black text-xs flex items-center justify-center font-bold">
                0
              </div>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-[320px] bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                <h3 className="font-semibold mb-3 text-white">Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="text-white">Notifications Here</div>
                )}
              </div>
            )}
          </div> */}

          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfilePanelOpen(true)}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
          >
            <img
              src={userData.profile_image}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-white/10"
              onError={(e) => {
                e.target.src =
                  "/uploads/profiles/default-profile-picture-male-icon.svg";
              }}
            />
            <div className="text-left">
              <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
                {userData.user_name}
              </h4>
              <p className="text-xs text-gray-400">{displayRole}</p>
            </div>
          </button>
        </div>
      </nav>

      {/* --- RIGHT SIDE PROFILE PANEL --- */}

      {/* Background Overlay */}
      {profilePanelOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setProfilePanelOpen(false)}
        ></div>
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0F172A]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${profilePanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Account Profile
          </h2>
          <button
            onClick={() => setProfilePanelOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {/* Avatar & Upload Section */}
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full border-2 border-[#A78BFA]/30 overflow-hidden relative shadow-lg bg-[#1E293B]">
              <img
                src={userData.profile_image}
                alt="Large Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "/uploads/profiles/default-profile-picture-male-icon.svg";
                }}
              />

              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                <Camera className="text-white mb-1" size={24} />
                <span className="text-white text-xs font-semibold">Change</span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">
            {userData.user_name}
          </h3>
          <span className="px-3 py-1 bg-[#A78BFA]/20 text-[#A78BFA] text-xs font-bold rounded-full uppercase tracking-wider mb-8">
            {displayRole}
          </span>

          {/* User Details */}
          <div className="w-full space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg text-[#A78BFA]">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Username
                </p>
                <p className="text-white font-semibold truncate">
                  {userData.user_name}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg text-[#A78BFA]">
                <Mail size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Email
                </p>
                <p className="text-white font-semibold truncate">
                  {userData.user_email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-all font-semibold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* --- SIGN OUT LOADER OVERLAY --- */}
      {isSigningOut && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <DreamKeyLoader />
        </div>
      )}
    </>
  );
}
