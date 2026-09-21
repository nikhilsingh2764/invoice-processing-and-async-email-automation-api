import { Outlet } from "react-router-dom";

import DashboardHeader from "../../components/navigation/DashboardHeader";
import Sidebar from "../../components/navigation/Sidebar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardHeader />

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        
      </div>
    </div>
  );
}

export default DashboardLayout;