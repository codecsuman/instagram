import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();

  const publicRoutes = ["/login", "/signup"];

  if (user && publicRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
