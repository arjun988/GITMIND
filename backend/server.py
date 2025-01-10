from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_cors import CORS
from pymongo import MongoClient
import requests
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import os
from dotenv import load_dotenv
import base64
import google.generativeai as genai
# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Solves CORS issues

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
app.config["JWT_SECRET_KEY"] = "JWT_SECRET_KEY"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["gitmind"]
users_collection = db["users"]

# AI Model Setup - Using FLAN-T5-small
model_name = "google/flan-t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

# GitHub Token (shared)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GEMINI_API_KEY = os.getenv("gemini_gpt_key")
genai.configure(api_key=GEMINI_API_KEY)
# Helper function for code documentation
def initialize_model():
    """Initialize and return a Gemini model instance"""
    return genai.GenerativeModel("gemini-pro")

# Initialize the model globally
gemini_model = initialize_model()

def generate_code_documentation(code):
    """
    Generates documentation for code using Google's Gemini API.
    Args:
        code (str): The source code to document
    Returns:
        str: Generated documentation
    """
    try:
        # Create a detailed prompt for better documentation
        prompt = f"""Please provide comprehensive documentation for the following code. Include:
1. Overall Purpose: Explain what this code does at a high level
2. Key Components: Break down the main parts and their functionality
3. Dependencies: List and explain important imports and dependencies
4. Configuration: Describe any important settings or configurations
5. Usage Instructions: How to use this code properly and technical details


CODE TO DOCUMENT:
```
{code}
```

Please provide clear, well-structured documentation that would be helpful for other developers."""

        # Generate the documentation
        response = gemini_model.generate_content(prompt)
        
        if response.text:
            # Clean up the response
            documentation = response.text.strip()
            
            # Remove any markdown code blocks if present
            documentation = documentation.replace("```", "")
            
            # Add formatting improvements
            documentation = documentation.replace(" : ", ": ")
            documentation = documentation.replace(" = ", "=")
            documentation = documentation.replace(" () ", "()")
            
            return documentation
        else:
            return "Error: Unable to generate documentation. Please try again."

    except Exception as e:
        # Handle potential API errors gracefully
        error_msg = f"Documentation generation failed: {str(e)}"
        print(error_msg)  # For server logs
        return f"Error generating documentation. Please try again later.\nError: {str(e)}"
# Routes remain the same except for generate_doc
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"message": "User already exists"}), 400
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    users_collection.insert_one({"email": data["email"], "password": hashed_password})
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = users_collection.find_one({"email": data["email"]})
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    token = create_access_token(identity=data["email"])
    return jsonify({"token": token}), 200

@app.route("/fetch_repo", methods=["POST"])
@jwt_required()
def fetch_repo():
    data = request.json
    if "repo_url" not in data:
        return jsonify({"message": "repo_url is required"}), 400

    repo_url = data["repo_url"]
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    
    parts = repo_url.split("/")
    if len(parts) < 5 or "github.com" not in parts:
        return jsonify({"message": "Invalid GitHub repo URL"}), 400

    owner, repo = parts[3], parts[4]

    def fetch_directory_contents(path=""):
        """
        Recursively fetch contents of directories in the repository
        Returns a list of all files and directories with their full paths
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            return []
        
        contents = response.json()
        result = []
        
        for item in contents:
            base_item = {
                "name": item["name"],
                "path": item["path"],
                "type": item["type"],
            }
            
            if item["type"] == "dir":
                base_item["contents"] = fetch_directory_contents(item["path"])
            else:
                base_item.update({
                    "size": item.get("size", 0),
                    "download_url": item.get("download_url"),
                    "sha": item.get("sha")
                })
            
            result.append(base_item)
        
        # Sort directories first, then files alphabetically
        return sorted(result, key=lambda x: (x["type"] != "dir", x["name"].lower()))

    try:
        # Fetch all contents recursively
        repo_contents = fetch_directory_contents()
        return jsonify({
            "repository": {
                "owner": owner,
                "name": repo,
                "contents": repo_contents
            }
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch repository structure: {str(e)}"}), 500

@app.route("/fetch_file_content", methods=["POST"])
@jwt_required()
def fetch_file_content():
    data = request.json
    if "repo_url" not in data:
        return jsonify({"message": "repo_url is required"}), 400

    repo_url = data["repo_url"]
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}

    if "raw.githubusercontent.com" in repo_url:
        parts = repo_url.split("/")

        if len(parts) < 7:
            return jsonify({"message": "Invalid GitHub raw URL format"}), 400

        owner, repo, branch, *file_path = parts[3:]
        file_path = "/".join(file_path)

        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}?ref={branch}",
            headers=headers
        )

        if response.status_code != 200:
            return jsonify({"message": "Failed to fetch file content"}), response.status_code

        file_content = response.json().get("content")
        if not file_content:
            return jsonify({"message": "No content found in file"}), 404

        decoded_content = base64.b64decode(file_content).decode('utf-8')
        return jsonify({"content": decoded_content}), 200
    else:
        return jsonify({"message": "Invalid GitHub repo URL"}), 400

@app.route("/generate_doc", methods=["POST"])
@jwt_required()
def generate_doc():
    data = request.json
    code = data["code"]
    documentation = generate_code_documentation(code)
    return jsonify({"documentation": documentation})

@app.route("/download_doc", methods=["POST"])
@jwt_required()
def download_doc():
    data = request.json
    file_name = f"{data['file_name']}_documentation.txt"
    with open(file_name, "w") as f:
        f.write(data["documentation"])
    return jsonify({"file_name": file_name}), 200

if __name__ == "__main__":
    app.run(debug=True)