import { useState } from "react";
import { Menu, Bell, Search, Moon } from "lucide-react";

import MobileSidebar from "./MobileSidebar";
import ProfileDropdown from "./ProfileDropdown";

function DashboardHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <h1 className="text-xl font-bold text-blue-600">
              InvoicePilot
            </h1>
          </div>

          {/* Search */}
          <div className="hidden w-full max-w-md items-center rounded-xl border border-slate-200 bg-slate-50 px-4 lg:flex">
            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search..."
              className="h-11 w-full bg-transparent px-3 outline-none"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 transition hover:bg-slate-100">
              <Bell size={20} />
            </button>

            <button className="rounded-xl p-2 transition hover:bg-slate-100">
              <Moon size={20} />
            </button>

            <ProfileDropdown />
          </div>
        </div>
      </header>

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}

export default DashboardHeader;