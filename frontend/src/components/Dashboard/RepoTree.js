import React from "react";

const RepoTree = ({ repoData, onFileSelect }) => {
  const renderTree = (items) => {
    // Check if we're dealing with the repository wrapper
    if (items?.repository) {
      return renderTree(items.repository.contents);
    }

    // Guard against null/undefined items
    if (!Array.isArray(items)) {
      return null;
    }

    return items.map((item) => (
      <li key={item.path}>
        {item.type === "file" ? (
          <button 
            onClick={() => onFileSelect(item)}
            
          >
            📄 {item.name}
          </button>
        ) : (
          <details >
            <summary >
              📁 {item.name}
            </summary>
            <ul >
              {renderTree(item.contents)}
            </ul>
          </details>
        )}
      </li>
    ));
  };

  return (
    <div >
      <h3 >Repository Structure</h3>
      <ul >
        {repoData ? renderTree(repoData) : <p>Loading repository structure...</p>}
      </ul>
    </div>
  );
};

export default RepoTree;