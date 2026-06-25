// frontend/src/components/ProtectedRoutes.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If user is already logged in and tries to visit login/signup
  if (user?._id && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  // If route is protected and user is not logged in
  if (!user?._id && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;