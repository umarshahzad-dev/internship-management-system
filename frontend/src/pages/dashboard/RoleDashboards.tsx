export function StudentDashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Student Dashboard
      </h2>
      <p className="text-gray-600">
        Your internship applications and daily logs will appear here.
      </p>
    </div>
  );
}

export function AcademicDashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Academic Dashboard
      </h2>
      <p className="text-gray-600">
        Review applications, manage SGK, and enter grades here.
      </p>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
      <p className="text-gray-600">
        Manage departments, users, calendars, and system configuration here.
      </p>
    </div>
  );
}
