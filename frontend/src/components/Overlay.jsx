import React, { useContext, useState } from 'react'
import { Loader } from './Loader';

export const Overlay = ({ isOpen, onClose,loading,setLoading,loadingMSG,showRoles,setShowRoles,roles,handleInterview,setInRole}) => {
  
    return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 left-4 text-white text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          <div className='flex flex-col items-center justify-center gap-y-30'>
          <Loader loading={loading} setLoading={setLoading} />
          {loading && <div className="text-xl font-bold text-white ml-8">{loadingMSG}</div>}
          {showRoles &&<div className="flex flex-col items-center justify-center gap-y-14">
          <div className="text-xl font-bold text-white text-center">These are the Role that fit your resume,<br/> Select the role you are interested to give the interview for:</div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {roles.map((role, index) => (
              <button key={index} className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={()=>{
                setInRole(role);
                setShowRoles(false);
                handleInterview(role);
              }}>{role}</button>
            ))}
          </div>
          </div> }

          </div>
          </div>}
      </>
      );
}
