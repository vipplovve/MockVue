
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResumeUploader from "./components/ResumeUploader";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Home } from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Interview from "./components/Interview";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/upload" element={<ProtectedRoute element ={<ResumeUploader />}/>} />
        <Route exact path="/auth" element={<Auth/>} />
        <Route exact path="/interview" element={<ProtectedRoute element ={<Interview/>} />}/>
      </Routes>
      <ToastContainer/>
    </Router>
  );
};

export default App;
