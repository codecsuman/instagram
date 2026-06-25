import React from "react";
import Posts from "./Posts";
import useGetAllPost from "@/hooks/useGetAllPost";

const Feed = () => {
  // fetch all posts when feed mounts
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