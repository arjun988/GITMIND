import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import RepoForm from "./components/Dashboard/RepoForm";
import RepoTree from "./components/Dashboard/RepoTree";
import FileViewer from "./components/Dashboard/FileViewer";
import DocumentationViewer from "./components/Dashboard/DocumentationViewer";

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
              <div>
                <RepoForm setRepoData={setRepoData} />
                <RepoTree repoData={repoData} onFileSelect={setSelectedFile} />
                {selectedFile && (
                  <FileViewer file={selectedFile} setDocumentation={setDocumentation} />
                )}
                {documentation && <DocumentationViewer documentation={documentation} />}
              </div>
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
