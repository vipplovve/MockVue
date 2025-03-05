import React, { useContext, useState } from "react";
import UploadFile from "../components/UploadFile";
import { Overlay } from "../components/Overlay";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import UserContext from "../context/user/UserContext";

const ResumeUploader = () => {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("Choose a file");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [loadingMSG, setLoadingMSG] = useState("Uploading...");
  const [showRoles, setShowRoles] = useState(false);
  const [roles, setRoles] = useState([]);
  const [difficulty, setDifficulty] = useState("fresher");

  const {setInRole} = useContext(UserContext);
  
  const handleInterview = async (role) => {
    try {
      setLoading(true);
      setLoadingMSG("Setting up interview...");
      const {data} = await axiosInstance.post("/genAi/genInterview", {role, difficulty, count:2});
      console.log(data);
      setLoading(false);
      setShowOverlay(false);
      nav(`/interview/${data.interviewId}`);
    } catch (err) {
      toast.error("Error setting up interview. Please try again.");
      console.error(err);
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);

    try {
      setShowOverlay(true);
      setLoading(true);
      setLoadingMSG("parsing resume..."); 
      await axiosInstance.post("/api/parse", formData);
      setLoadingMSG("categorizing resume..."); 
      const {data} = await axiosInstance.get("/ML/categorize");
      setRoles(data.roles);
      setLoading(false);
      setShowRoles(true);
      console.log(data);

    } catch (err) {
      toast.error("Error uploading file. Please try again.");
      console.error(err);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "Choose a file");
  };

  return (
    <>
    <Overlay 
      isOpen={showOverlay} 
      onClose={() => setShowOverlay(false)} 
      loading={loading} 
      setLoading={setLoading} 
      loadingMSG={loadingMSG} 
      showRoles={showRoles} 
      setShowRoles={setShowRoles} 
      roles={roles} 
      handleInterview={handleInterview} 
      setInRole={setInRole}
    />
  
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Left Half (New Component) */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        dfujbvkdfjvb
      </div>
  
      {/* Right Half (UploadFile Component) */}
      <div className="w-1/2 flex items-center justify-center">
        <UploadFile 
          file={file} 
          setFile={setFile} 
          fileName={fileName} 
          setFileName={setFileName} 
          handleUpload={handleUpload} 
          handleFileChange={handleFileChange} 
        />
      </div>
    </div>
  </>
  
  );
};

export default ResumeUploader;
