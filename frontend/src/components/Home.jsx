import React from "react";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import SuggestedUsers from "./SuggestedUsers";

const Home = () => {
  return (
    <div className="flex w-full justify-center">
      {/* FEED SECTION */}
      <div className="flex-grow max-w-2xl">
        <Feed />
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden lg:block w-[350px] sticky top-6 self-start">
        <div className="flex flex-col gap-6">
          <RightSidebar />
          <SuggestedUsers />
        </div>
      </div>
    </div>
  );
};

export default Home;