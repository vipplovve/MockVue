import React from "react";

const GLogin = () => {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_SERVER_URL}/auth/google`;
  };

  return (
    <button
      className=" font-semibold w-80 px-4 py-2 border flex justify-center items-center gap-4 border-green-400 dark:border-green-400 rounded-lg text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-900 dark:hover:text-stone-300 hover:shadow transition duration-150"
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