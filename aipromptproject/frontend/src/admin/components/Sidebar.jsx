// src/admin/components/Sidebar.jsx
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LayoutDashboard,
//   Users,
//   Sparkles,
//   FolderTree,
//   Wallet,
//   Flag,
//   ChevronDown,
//   ArrowLeftRight,
//   BadgeDollarSign,
//   UserX,
//   FileWarning,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// // 1. Accept activeItem and setActiveItem as props here
// export default function Sidebar({ activeItem, setActiveItem }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [hoverLogo, setHoverLogo] = useState(false);

//   // 2. REMOVED the local activeItem state completely!
//   const [transactionOpen, setTransactionOpen] = useState(false);
//   const [reportOpen, setReportOpen] = useState(false);

//   const [transactionHovered, setTransactionHovered] = useState(false);
//   const [reportHovered, setReportHovered] = useState(false);

//   const handleItemClick = (itemName) => {
//     setActiveItem(itemName);
//     if (!isOpen) {
//       setTransactionOpen(false);
//       setReportOpen(false);
//     }
//   };

//   return (
//     <motion.div
//       animate={{ width: isOpen ? 260 : 80 }}
//       transition={{ duration: 0.35, ease: "easeInOut" }}
//       className="h-screen bg-[rgba(17,24,39,0.95)] text-gray-300 backdrop-blur-md border-r border-white/10 relative z-40"
//     >
//       <div className="flex flex-col h-full p-3 whitespace-nowrap">
//         {/* TOP HEADER */}
//         <div className="flex items-center px-2 py-4 min-h-[72px] relative">
//           <div
//             className="relative w-10 h-10 flex-shrink-0 cursor-pointer z-10"
//             onMouseEnter={() => !isOpen && setHoverLogo(true)}
//             onMouseLeave={() => !isOpen && setHoverLogo(false)}
//             onClick={() => !isOpen && setIsOpen(true)}
//           >
//             <AnimatePresence mode="wait">
//               {!isOpen && hoverLogo ? (
//                 <motion.div
//                   key="menu-icon"
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.5 }}
//                   transition={{ duration: 0.15 }}
//                   className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
//                 >
//                   <ChevronRight size={20} />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="logo"
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.5 }}
//                   transition={{ duration: 0.15 }}
//                   className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#A78BFA] font-bold text-black"
//                 >
//                   D
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.button
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -10 }}
//                 transition={{ duration: 0.2 }}
//                 onClick={() => {
//                   setIsOpen(false);
//                   setHoverLogo(false);
//                   setTransactionOpen(false);
//                   setReportOpen(false);
//                 }}
//                 className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition text-white"
//               >
//                 <ChevronLeft size={20} />
//               </motion.button>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* MENU */}
//         <div className="mt-6 flex flex-col gap-2">
//           <SidebarItem
//             isOpen={isOpen}
//             icon={<LayoutDashboard size={22} />}
//             label="Dashboard"
//             isActive={activeItem === "Dashboard"}
//             onClick={() => handleItemClick("Dashboard")}
//           />
//           <SidebarItem
//             isOpen={isOpen}
//             icon={<Users size={22} />}
//             label="User"
//             isActive={activeItem === "User"}
//             onClick={() => handleItemClick("User")}
//           />
//           <SidebarItem
//             isOpen={isOpen}
//             icon={<Sparkles size={22} />}
//             label="Prompt"
//             isActive={activeItem === "Prompt"}
//             onClick={() => handleItemClick("Prompt")}
//           />
//           <SidebarItem
//             isOpen={isOpen}
//             icon={<FolderTree size={22} />}
//             label="Category"
//             isActive={activeItem === "Category"}
//             onClick={() => handleItemClick("Category")}
//           />

//           {/* Transaction Dropdown Container */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setTransactionOpen(!transactionOpen);
//                 if (!isOpen) setReportOpen(false);
//               }}
//               onMouseEnter={() => setTransactionHovered(true)}
//               onMouseLeave={() => setTransactionHovered(false)}
//               className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
//                 !isOpen && transactionOpen
//                   ? "bg-white/10 text-[#C4B5FD]"
//                   : "hover:bg-white/10 hover:text-[#C4B5FD]"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <Wallet size={22} />
//                 {isOpen && (
//                   <span className="text-sm font-medium">Transaction</span>
//                 )}
//               </div>
//               {isOpen && (
//                 <ChevronDown
//                   size={18}
//                   className={`transition-transform ${transactionOpen ? "rotate-180" : ""}`}
//                 />
//               )}
//             </button>

//             <Tooltip
//               label="Transaction"
//               isVisible={!isOpen && transactionHovered && !transactionOpen}
//             />

//             {/* INLINE MENU */}
//             <AnimatePresence>
//               {isOpen && transactionOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="ml-4 mt-2 flex flex-col gap-2 overflow-hidden"
//                 >
//                   <DropdownItem
//                     icon={<ArrowLeftRight size={18} />}
//                     label="User to User"
//                     isActive={activeItem === "User to User"}
//                     onClick={() => handleItemClick("User to User")}
//                   />
//                   <DropdownItem
//                     icon={<BadgeDollarSign size={18} />}
//                     label="Admin to User"
//                     isActive={activeItem === "Admin to User"}
//                     onClick={() => handleItemClick("Admin to User")}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* FLOATING MENU */}
//             <AnimatePresence>
//               {!isOpen && transactionOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className="absolute left-[75px] top-0 z-50 w-52 bg-[#111827]/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl shadow-purple-500/10 flex flex-col gap-1"
//                 >
//                   <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
//                     Transaction
//                   </div>
//                   <DropdownItem
//                     icon={<ArrowLeftRight size={18} />}
//                     label="User to User"
//                     isActive={activeItem === "User to User"}
//                     onClick={() => handleItemClick("User to User")}
//                   />
//                   <DropdownItem
//                     icon={<BadgeDollarSign size={18} />}
//                     label="Admin to User"
//                     isActive={activeItem === "Admin to User"}
//                     onClick={() => handleItemClick("Admin to User")}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Report Dropdown Container */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setReportOpen(!reportOpen);
//                 if (!isOpen) setTransactionOpen(false);
//               }}
//               onMouseEnter={() => setReportHovered(true)}
//               onMouseLeave={() => setReportHovered(false)}
//               className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
//                 !isOpen && reportOpen
//                   ? "bg-white/10 text-[#C4B5FD]"
//                   : "hover:bg-white/10 hover:text-[#C4B5FD]"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <Flag size={22} />
//                 {isOpen && <span className="text-sm font-medium">Report</span>}
//               </div>
//               {isOpen && (
//                 <ChevronDown
//                   size={18}
//                   className={`transition-transform ${reportOpen ? "rotate-180" : ""}`}
//                 />
//               )}
//             </button>

//             <Tooltip
//               label="Report"
//               isVisible={!isOpen && reportHovered && !reportOpen}
//             />

//             {/* INLINE MENU */}
//             <AnimatePresence>
//               {isOpen && reportOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="ml-4 mt-2 flex flex-col gap-2 overflow-hidden"
//                 >
//                   <DropdownItem
//                     icon={<UserX size={18} />}
//                     label="User Report"
//                     isActive={activeItem === "User Report"}
//                     onClick={() => handleItemClick("User Report")}
//                   />
//                   <DropdownItem
//                     icon={<FileWarning size={18} />}
//                     label="Prompt Report"
//                     isActive={activeItem === "Prompt Report"}
//                     onClick={() => handleItemClick("Prompt Report")}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* FLOATING MENU */}
//             <AnimatePresence>
//               {!isOpen && reportOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className="absolute left-[75px] top-0 z-50 w-52 bg-[#111827]/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl shadow-purple-500/10 flex flex-col gap-1"
//                 >
//                   <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
//                     Report
//                   </div>
//                   <DropdownItem
//                     icon={<UserX size={18} />}
//                     label="User Report"
//                     isActive={activeItem === "User Report"}
//                     onClick={() => handleItemClick("User Report")}
//                   />
//                   <DropdownItem
//                     icon={<FileWarning size={18} />}
//                     label="Prompt Report"
//                     isActive={activeItem === "Prompt Report"}
//                     onClick={() => handleItemClick("Prompt Report")}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// /* ----------------- Sub-Components (Stay identical) ----------------- */
// function SidebarItem({ icon, label, isOpen, isActive, onClick }) {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <div className="relative">
//       <button
//         onClick={onClick}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//           isActive
//             ? "bg-[#C4B5FD] text-gray-900 shadow-lg shadow-purple-500/10 font-medium"
//             : "text-gray-300 hover:bg-white/10 hover:text-[#C4B5FD]"
//         }`}
//       >
//         {icon}
//         {isOpen && <span className="text-sm">{label}</span>}
//       </button>
//       <Tooltip label={label} isVisible={!isOpen && isHovered} />
//     </div>
//   );
// }

// function DropdownItem({ icon, label, isActive, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all w-full text-left ${
//         isActive
//           ? "bg-[#C4B5FD] text-gray-900 font-medium shadow-md"
//           : "text-gray-400 hover:bg-white/10 hover:text-[#C4B5FD]"
//       }`}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }

// function Tooltip({ label, isVisible }) {
//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, x: -5 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -5 }}
//           transition={{ duration: 0.15 }}
//           className="absolute left-[75px] top-1/2 -translate-y-1/2 z-50 px-3 py-2 bg-[#111827]/95 backdrop-blur-md border border-white/10 text-[#C4B5FD] text-sm rounded-lg whitespace-nowrap shadow-xl font-medium pointer-events-none"
//         >
//           {label}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// src/admin/components/Sidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  FolderTree,
  Flag,
  ChevronDown,
  UserX,
  FileWarning,
  ChevronLeft,
  ChevronRight,
  ThumbsDown,
} from "lucide-react";

export default function Sidebar({ activeItem, setActiveItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverLogo, setHoverLogo] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportHovered, setReportHovered] = useState(false);

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
    if (!isOpen) {
      setReportOpen(false);
    }
  };

  return (
    <motion.div
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="h-screen bg-[rgba(17,24,39,0.95)] text-gray-300 backdrop-blur-md border-r border-white/10 relative z-40"
    >
      <div className="flex flex-col h-full p-3 whitespace-nowrap">
        {/* TOP HEADER */}
        <div className="flex items-center px-2 py-4 min-h-[72px] relative">
          <div
            className="relative w-10 h-10 flex-shrink-0 cursor-pointer z-10"
            onMouseEnter={() => !isOpen && setHoverLogo(true)}
            onMouseLeave={() => !isOpen && setHoverLogo(false)}
            onClick={() => !isOpen && setIsOpen(true)}
          >
            <AnimatePresence mode="wait">
              {!isOpen && hoverLogo ? (
                <motion.div
                  key="menu-icon"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#A78BFA] font-bold text-black"
                >
                  D
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setIsOpen(false);
                  setHoverLogo(false);
                  setReportOpen(false);
                }}
                className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition text-white"
              >
                <ChevronLeft size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* MENU */}
        <div className="mt-6 flex flex-col gap-2">
          <SidebarItem
            isOpen={isOpen}
            icon={<LayoutDashboard size={22} />}
            label="Dashboard"
            isActive={activeItem === "Dashboard"}
            onClick={() => handleItemClick("Dashboard")}
          />
          <SidebarItem
            isOpen={isOpen}
            icon={<Users size={22} />}
            label="User"
            isActive={activeItem === "User"}
            onClick={() => handleItemClick("User")}
          />
          <SidebarItem
            isOpen={isOpen}
            icon={<Sparkles size={22} />}
            label="Prompt"
            isActive={activeItem === "Prompt"}
            onClick={() => handleItemClick("Prompt")}
          />
          <SidebarItem
            isOpen={isOpen}
            icon={<FolderTree size={22} />}
            label="Category"
            isActive={activeItem === "Category"}
            onClick={() => handleItemClick("Category")}
          />

          {/* Report Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => {
                setReportOpen(!reportOpen);
              }}
              onMouseEnter={() => setReportHovered(true)}
              onMouseLeave={() => setReportHovered(false)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${!isOpen && reportOpen
                  ? "bg-white/10 text-[#C4B5FD]"
                  : "hover:bg-white/10 hover:text-[#C4B5FD]"
                }`}
            >
              <div className="flex items-center gap-3">
                <Flag size={22} />
                {isOpen && <span className="text-sm font-medium">Report</span>}
              </div>
              {isOpen && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${reportOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            <Tooltip
              label="Report"
              isVisible={!isOpen && reportHovered && !reportOpen}
            />

            {/* INLINE MENU */}
            <AnimatePresence>
              {isOpen && reportOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 mt-2 flex flex-col gap-2 overflow-hidden"
                >
                  <DropdownItem
                    icon={<UserX size={18} />}
                    label="User Report"
                    isActive={activeItem === "User Report"}
                    onClick={() => handleItemClick("User Report")}
                  />
                  <DropdownItem
                    icon={<FileWarning size={18} />}
                    label="Prompt Report"
                    isActive={activeItem === "Prompt Report"}
                    onClick={() => handleItemClick("Prompt Report")}
                  />
                  <DropdownItem
                    icon={<ThumbsDown size={18} />}
                    label="Bad Review"
                    isActive={activeItem === "Bad Review"}
                    onClick={() => handleItemClick("Bad Review")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING MENU */}
            <AnimatePresence>
              {!isOpen && reportOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[75px] top-0 z-50 w-52 bg-[#111827]/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl shadow-purple-500/10 flex flex-col gap-1"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Report
                  </div>
                  <DropdownItem
                    icon={<UserX size={18} />}
                    label="User Report"
                    isActive={activeItem === "User Report"}
                    onClick={() => handleItemClick("User Report")}
                  />
                  <DropdownItem
                    icon={<FileWarning size={18} />}
                    label="Prompt Report"
                    isActive={activeItem === "Prompt Report"}
                    onClick={() => handleItemClick("Prompt Report")}
                  />
                  <DropdownItem
                    icon={<ThumbsDown size={18} />}
                    label="Bad Review"
                    isActive={activeItem === "Bad Review"}
                    onClick={() => handleItemClick("Bad Review")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------- Sub-Components ----------------- */
function SidebarItem({ icon, label, isOpen, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
            ? "bg-[#C4B5FD] text-gray-900 shadow-lg shadow-purple-500/10 font-medium"
            : "text-gray-300 hover:bg-white/10 hover:text-[#C4B5FD]"
          }`}
      >
        {icon}
        {isOpen && <span className="text-sm">{label}</span>}
      </button>
      <Tooltip label={label} isVisible={!isOpen && isHovered} />
    </div>
  );
}

function DropdownItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all w-full text-left ${isActive
          ? "bg-[#C4B5FD] text-gray-900 font-medium shadow-md"
          : "text-gray-400 hover:bg-white/10 hover:text-[#C4B5FD]"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Tooltip({ label, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.15 }}
          className="absolute left-[75px] top-1/2 -translate-y-1/2 z-50 px-3 py-2 bg-[#111827]/95 backdrop-blur-md border border-white/10 text-[#C4B5FD] text-sm rounded-lg whitespace-nowrap shadow-xl font-medium pointer-events-none"
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
