// src/admin/layout/AdminLayout.jsx
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children, activeItem, setActiveItem }) {
  return (
    <div className="flex h-screen bg-[#111827] text-white overflow-hidden">
      {/* Sidebar - Added the props here */}
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* Right Side */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#161B22]">
          {children}
        </main>
      </div>
    </div>
  );
}
