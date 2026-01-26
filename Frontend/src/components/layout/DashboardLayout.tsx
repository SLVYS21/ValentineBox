import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  title?: string;
}

export function DashboardLayout({ title = "Tableau de bord" }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-gray-50 font-sans">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={title} />
        <main className="bg-gray-50 flex-1 p-6 overflow-auto font-sans">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
