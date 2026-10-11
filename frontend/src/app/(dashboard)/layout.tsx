import { AuthGuard } from "@/components/AuthGuard";
import { FarmDataGate } from "@/components/FarmDataGate";
import { RoleGuard } from "@/components/RoleGuard";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { FarmProvider } from "@/lib/farm-store";
import { SidebarProvider } from "@/lib/sidebar-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FarmProvider>
        <SidebarProvider>
          <div className="shell flex min-h-screen">
            <Sidebar />
            <main className="main min-w-0 flex-1">
              <Topbar />
              <div className="mx-auto max-w-[1260px] px-4 py-6 pb-24 sm:px-8 sm:py-7 sm:pb-7">
                <RoleGuard>
                  <FarmDataGate>{children}</FarmDataGate>
                </RoleGuard>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </FarmProvider>
    </AuthGuard>
  );
}
