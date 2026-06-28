import React from "react";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
    <div className="flex w-full justify-center">
      {/* Feed */}
      <div className="flex-grow max-w-2xl">
        <Feed />
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[350px] sticky top-6 self-start">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;