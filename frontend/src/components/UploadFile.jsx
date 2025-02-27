import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

const UploadFile = () => {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("Choose a file");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "Choose a file");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);

    try {
      await axiosInstance.post("/api/parse", formData);
      toast.success("Resume uploaded successfully!");
      nav("/interview");
    } catch (err) {
      toast.error("Error uploading file. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="containerf">
      <div className="folder">
        <div className="front-side">
          <div className="tip"></div>
          <div className="cover"></div>
        </div>
        <div className="back-side cover"></div>
      </div>
      <label className="custom-file-upload">
        <input className="title" type="file" accept="application/pdf" onChange={handleFileChange} />
        {fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}
      </label>
      <button className="upload-button" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default UploadFile;
