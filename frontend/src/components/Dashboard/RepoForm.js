import React, { useState } from "react";
import API from "../../api";
import { Loader, AlertCircle } from "lucide-react";

const RepoForm = ({ setRepoData }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/fetch_repo", { repo_url: repoUrl });
      setRepoData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch repository data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <input
        type="text"
        placeholder="GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        required
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? <Loader className="animate-spin" /> : "Fetch Repository"}
      </button>
      {error && (
        <p className="text-red-500 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </p>
      )}
    </form>
  );
};

export default RepoForm;
