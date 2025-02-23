
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResumeUploader from "./components/ResumeUploader";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Home } from "./pages/Home";
import Auth from "./pages/Auth";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/upload" element={<ResumeUploader />} />
        <Route exact path="/auth" element={<Auth/>} />
      </Routes>
      <ToastContainer/>
    </Router>
  );
};

export default App;
