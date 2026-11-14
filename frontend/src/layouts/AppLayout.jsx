import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-[260px]">
        <TopNavbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <Outlet />
        </main>
        <footer className="px-4 pb-6 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#88897f] sm:px-7 lg:px-9">BooksVault · A library in good order</footer>
      </div>
    </div>
  );
}
