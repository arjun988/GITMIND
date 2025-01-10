import React, { useState } from "react";
import {  Loader } from "lucide-react";
import API from "../../api";
const FileViewer = ({ file, setDocumentation }) => {
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFileContent = async () => {
    setLoading(true);
    try {
      const rawUrl = file.download_url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
      const response = await API.post("/fetch_file_content", { repo_url: rawUrl });
      setFileContent(response.data.content);
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentation = async () => {
    try {
      const response = await API.post("/generate_doc", { code: fileContent });
      setDocumentation(response.data.documentation);
    } catch (err) {
      console.error("Failed to generate documentation:", err);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h3 className="text-xl font-bold mb-4">File: {file.name}</h3>
      <button
        onClick={fetchFileContent}
        className="w-full p-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
      >
        {loading ? <Loader className="animate-spin" /> : "View File Content"}
      </button>
      <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{fileContent}</pre>
      <button
        onClick={generateDocumentation}
        className="w-full p-2 bg-green-500 text-white rounded-md mt-4 hover:bg-green-600"
      >
        Generate Documentation
      </button>
    </div>
  );
};

export default FileViewer;
