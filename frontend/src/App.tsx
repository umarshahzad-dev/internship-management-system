import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">IMAS</h1>
        <p className="text-gray-700">
          Internship Management & Automation System
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Frontend is running. Backend health:{" "}
          <a
            href="http://localhost:3000/api/v1/health"
            className="text-blue-500 underline"
          >
            check here
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;