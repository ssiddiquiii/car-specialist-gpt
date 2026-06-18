import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ChatLayout from "../layouts/ChatLayout";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ChatPage from "../pages/Chat/ChatPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuthStore } from "../store/authStore";

// A wrapper to prevent authenticated users from seeing login/register pages
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes wrapped in MainLayout (Navbar/Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Auth routes (No MainLayout, full screen) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected chat routes — wrapped in ChatLayout (sidebar + topbar) */}
        <Route
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
