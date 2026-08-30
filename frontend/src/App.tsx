import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route
            path="/forgot-password"
            element={<PlaceholderPage title="Forgot Password" />}
          />
          <Route
            path="/reset-password"
            element={<PlaceholderPage title="Reset Password" />}
          />

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
