// frontend/src/components/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  const { user } = useSelector((store) => store.auth);

  // Optional safety while auth state hydrates
  if (user === undefined) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* LEFT SIDEBAR */}
      <LeftSidebar />

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1
          min-h-screen
          ml-[250px]
          overflow-x-hidden
          bg-white
        "
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;