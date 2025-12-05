import React from "react";
import Posts from "./Posts";
import useGetAllPost from "@/hooks/useGetAllPost";

const Feed = () => {
  // 🔥 Always load posts on feed mount
  useGetAllPost();

  return (
    <div className="flex flex-1 justify-center my-8">
      <div className="max-w-xl w-full">
        <Posts />
      </div>
    </div>
  );
};

export default Feed;
