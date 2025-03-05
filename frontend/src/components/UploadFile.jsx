import React from "react";

const UploadFile = ({file,setFile,fileName,setFileName,handleUpload,handleFileChange}) => {
  return (
    <div className="containerf w-96 bg-gradient-to-b from-blue-800 to-blue-950">
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
      <button className="upload-button font-bold bg-[#ffe563] text-gray-600" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default UploadFile;
