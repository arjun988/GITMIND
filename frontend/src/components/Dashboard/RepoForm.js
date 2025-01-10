import React, { useState } from "react";
import API from "../../api";

const RepoForm = ({ setRepoData }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    try {
      const { data } = await API.post("/fetch_repo", { repo_url: repoUrl });
      setRepoData(data); // Update the repo data in the parent component
    } catch (err) {
      console.error(err.response?.data?.message || "An error occurred");
      setError(err.response?.data?.message || "Failed to fetch repository data");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <input
        type="text"
        placeholder="GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Fetch Repository
      </button>
      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}
    </form>
  );
};

export default RepoForm;
