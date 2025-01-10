import React from "react";

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
    <div>
      <h3>Generated Documentation</h3>
      <pre>{documentation}</pre>
      <button onClick={handleCopy}>Copy</button>
      <button onClick={handleDownload}>Download</button>
    </div>
  );
};

export default DocumentationViewer;
