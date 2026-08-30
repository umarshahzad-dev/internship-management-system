import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  StudentDashboard,
  AcademicDashboard,
  AdminDashboard,
} from "../pages/dashboard/RoleDashboards";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderDashboard = () => {
    switch (user.role) {
      case "STUDENT":
        return <StudentDashboard />;
      case "ACADEMIC":
        return <AcademicDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">IMAS</h1>
            <nav className="hidden md:flex space-x-4">
              {user.role === "STUDENT" && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    My Internships
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Daily Logs
                  </Link>
                </>
              )}
              {user.role === "ACADEMIC" && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Evaluations
                  </Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Users
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Calendars
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Reports
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{renderDashboard()}</main>
    </div>
  );
}
