import { useState } from "react";
import { useSaaSStore } from "../../store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navCollapsed = useSaaSStore((s) => s.navCollapsed);
  const toggleNav = useSaaSStore((s) => s.toggleNav);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--main-bg)] text-[var(--text)]">
      <Sidebar collapsed={navCollapsed} onToggle={toggleNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div key={typeof window !== "undefined" ? window.location.pathname : "page"} className="anim-fade page-wrap">
            <div className="page-inner">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
