import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatTopBar from "../components/ChatTopBar/ChatTopBar";
import { useChatStore } from "../store/chatStore";

function ChatLayout() {
  const { sidebarOpen, setSidebarOpen } = useChatStore();

  // Close sidebar on small screens by default
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) setSidebarOpen(false);

    const handler = (e) => {
      if (e.matches) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setSidebarOpen]);

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "var(--bg-base)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
            display: "none",
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content column */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        <ChatTopBar />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default ChatLayout;
