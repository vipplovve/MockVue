
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ResumeUploader from "./pages/ResumeUploader";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Home } from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Interview from "./pages/Interview";
import Navbar2 from "./components/Navbar";
import FloatingBar from "./components/FloatingBar";
import ResumeReview from "./pages/ResumeReview";

const App = () => {
  return (
    <Router>
      <Navbar2/>
      <div className="mt-16 ">
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/review" element={<ResumeReview/>} />
        <Route exact path="/upload" element={<ProtectedRoute element ={<ResumeUploader />}/>} />
        <Route exact path="/auth" element={<Auth/>} />
        <Route exact path="/interview/:interviewId" element={<ProtectedRoute element ={<Interview/>} />}/>
      </Routes>
      </div>
      <FloatingBar/>
      <ToastContainer/>
    </Router>
  );
};

export default App;
