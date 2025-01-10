import React from "react";
import { Folder, FileText } from "lucide-react";

const RepoTree = ({ repoData, onFileSelect }) => {
  const renderTree = (items) => {
    if (items?.repository) {
      return renderTree(items.repository.contents);
    }

    if (!Array.isArray(items)) {
      return null;
    }

    return items.map((item) => (
      <li key={item.path} className="ml-4">
        {item.type === "file" ? (
          <button
            onClick={() => onFileSelect(item)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-500"
          >
            <FileText /> {item.name}
          </button>
        ) : (
          <details className="cursor-pointer">
            <summary className="flex items-center gap-2 text-gray-700 hover:text-blue-500">
              <Folder /> {item.name}
            </summary>
            <ul className="ml-4">{renderTree(item.contents)}</ul>
          </details>
        )}
      </li>
    ));
  };

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h3 className="text-xl font-bold mb-4">Repository Structure</h3>
      <ul className="list-none space-y-2">
        {repoData ? renderTree(repoData) : <p>Loading repository structure...</p>}
      </ul>
    </div>
  );
};

export default RepoTree;
