import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/user/UserContext";

const ProtectedRoute = ({ element }) => {
  const { currUser } = useContext(UserContext);
  if (!currUser) {
    return <Navigate to="/auth" />;
  }
  return element;
};

export default ProtectedRoute;