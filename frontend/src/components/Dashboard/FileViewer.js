import React, { useState } from "react";
import API from "../../api";

const FileViewer = ({ file, setDocumentation }) => {
  const [fileContent, setFileContent] = useState("");

  const fetchFileContent = async () => {
    try {
      // Convert to raw GitHub URL
      const rawUrl = file.download_url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");

      // Make a request to the backend to fetch the file content
      const { data } = await API.post("/fetch_file_content", { repo_url: rawUrl });
      setFileContent(data.content); // Assuming 'content' is returned by the backend
    } catch (err) {
      console.error("Failed to fetch file content:", err);
    }
  };

  const generateDocumentation = async () => {
    try {
      const { data } = await API.post("/generate_doc", { code: fileContent });
      setDocumentation(data.documentation);
    } catch (err) {
      console.error("Failed to generate documentation:", err);
    }
  };

  return (
    <div>
      <h3>File: {file.name}</h3>
      <button onClick={fetchFileContent}>View File Content</button>
      <pre>{fileContent}</pre>
      <button onClick={generateDocumentation}>Generate Documentation</button>
    </div>
  );
};

export default FileViewer;
