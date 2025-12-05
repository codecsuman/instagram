import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import { useSelector } from "react-redux";

const MainLayout = () => {
  const { user } = useSelector((store) => store.auth);

  // ⛑️ Prevent layout from rendering before user loads
  if (user === undefined) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-white">

      {/* FIXED LEFT SIDEBAR */}
      <LeftSidebar />

      {/* MAIN CONTENT */}
      <div
        className="
          flex-1
          min-h-screen
          relative
          overflow-x-hidden
          overflow-y-scroll
          ml-[250px]
          max-w-full
        "
      >
        <Outlet />
      </div>

    </div>
  );
};

export default MainLayout;
