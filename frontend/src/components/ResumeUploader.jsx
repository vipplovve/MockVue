import React, {useEffect, useState } from "react";
import axios from "axios";

const ResumeUploader = () => {
  useEffect(() => {
    axios.get("http://localhost:3000/auth/user", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [])
  
  const [file, setFile] = useState(null);
  const [parsedText, setParsedText] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setError("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await axios.post("http://localhost:3000/api/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(data);
      setParsedText(data.text);
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="w-full p-2 border border-gray-300 rounded-md"
      />

      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
      >
        Upload
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {parsedText && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-left">
          <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap text-gray-700">{parsedText}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
