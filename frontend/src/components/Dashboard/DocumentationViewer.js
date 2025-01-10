import React from "react";
import { Copy, Download } from "lucide-react";

const DocumentationViewer = ({ documentation }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(documentation);
    alert("Documentation copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([documentation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documentation.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h3 className="text-xl font-bold mb-4">Generated Documentation</h3>
      <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{documentation}</pre>
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Copy /> Copy
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Download /> Download
        </button>
      </div>
    </div>
  );
};

export default DocumentationViewer;
