import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 w-full mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
