import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardLayout } from "./components/DashboardLayout";

function HomeRedirect() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />} />
          </Route>

          <Route
            path="/unauthorized"
            element={<PlaceholderPage title="Unauthorized" />}
          />

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
