import React, { useContext, useEffect } from "react";
import UserContext from "../context/user/UserContext";
import { useNavigate } from "react-router-dom";

const GLogin = () => {
    const nav = useNavigate();
    const {getUser,currUser} = useContext(UserContext);
    useEffect(() => {
        getUser();
    }, []);
    useEffect(() => {
        if(currUser) nav("/upload");
    }, [currUser]);
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <button
      className=" font-semibold w-80 px-4 py-2 border flex justify-center items-center gap-4 border-blue-700 dark:border-blue-900 rounded-lg text-gray-200 dark:text-gray-100 hover:border-gray-200 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:shadow transition duration-150"
      onClick={handleLogin}
    >
      <img
        className="w-6 h-6"
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
      />
      <span className="text-2xl">Login with Google</span>
    </button>
  );
};

export default GLogin;