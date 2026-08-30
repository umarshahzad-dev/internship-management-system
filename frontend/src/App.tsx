import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<PlaceholderPage title="Dashboard" />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={<PlaceholderPage title="Admin Dashboard" />}
            />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["ACADEMIC", "ADMIN"]} />}
          >
            <Route
              path="/academic"
              element={<PlaceholderPage title="Academic Dashboard" />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route
              path="/student"
              element={<PlaceholderPage title="Student Dashboard" />}
            />
          </Route>

          <Route
            path="/unauthorized"
            element={<PlaceholderPage title="Unauthorized" />}
          />

          <Route path="/" element={<PlaceholderPage title="Home" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
