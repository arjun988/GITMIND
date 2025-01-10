import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import RepoForm from "./components/Dashboard/RepoForm";
import RepoTree from "./components/Dashboard/RepoTree";
import FileViewer from "./components/Dashboard/FileViewer";
import DocumentationViewer from "./components/Dashboard/DocumentationViewer";
import { LogOut } from "lucide-react";

const Dashboard = ({ loggedIn, setLoggedIn, repoData, setRepoData, selectedFile, setSelectedFile, documentation, setDocumentation }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold">Dashboard</div>
        <div className="flex-grow p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 bg-red-500 hover:bg-red-600 rounded-md w-full text-left"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <RepoForm setRepoData={setRepoData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <RepoTree repoData={repoData} onFileSelect={setSelectedFile} />
            </div>
            {selectedFile && (
              <div className="bg-white p-4 rounded-lg shadow">
                <FileViewer file={selectedFile} setDocumentation={setDocumentation} />
              </div>
            )}
          </div>

          {documentation && (
            <div className="bg-white p-4 rounded-lg shadow">
              <DocumentationViewer documentation={documentation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [repoData, setRepoData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentation, setDocumentation] = useState("");

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/dashboard" /> : <Login setLoggedIn={setLoggedIn} />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            loggedIn ? (
              <Dashboard
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
                repoData={repoData}
                setRepoData={setRepoData}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                documentation={documentation}
                setDocumentation={setDocumentation}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
