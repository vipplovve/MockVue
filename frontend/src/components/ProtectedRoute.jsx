import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/user/UserContext";

const ProtectedRoute = ({ element }) => {
  const { currUser } = useContext(UserContext);
  return element;
  if (!currUser) {
    return <Navigate to="/auth" />;
  }
};

export default ProtectedRoute;