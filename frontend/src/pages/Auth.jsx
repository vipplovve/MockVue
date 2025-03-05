import React from "react";
import { motion } from "framer-motion";
import GLogin from "../components/GLogin";

const Auth = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black text-white h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col justify-center items-center text-center gap-4">
        <motion.img
          src="/logo.png"
          alt="logo"
          className="w-38 h-38"
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        <motion.h1
          className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="block">Welcome to</span>
          <motion.span
            className="text-blue-800 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            MockVue !
          </motion.span>
        </motion.h1>
        <motion.p
          className="mt-4 text-xl font-semibold sm:text-xl text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="block">Please Login To Continue</span>
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <GLogin />
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;