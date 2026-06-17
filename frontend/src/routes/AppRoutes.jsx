import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuthStore } from "../store/authStore";

// A wrapper to prevent authenticated users from seeing login/register pages
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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

        {/* Protected routes (e.g., Chat Interface - To be built in Phase 3) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              {/* Temporary placeholder for Phase 3 */}
              <div className="flex h-screen items-center justify-center bg-slate-50 text-xl font-semibold text-slate-900">
                Chat Interface (Phase 3)
              </div>
            </ProtectedRoute>
          }
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
