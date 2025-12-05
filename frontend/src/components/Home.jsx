import React from "react";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
    <div className="flex w-full justify-center">
      
      {/* FEED SECTION */}
      <div className="flex-grow max-w-2xl">
        <Feed />
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden lg:block w-[350px]">
        <RightSidebar />
      </div>

    </div>
  );
};

export default Home;
