import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  const posts = useSelector((state) => state.post.posts);

  const loading = !posts || posts.length === 0;

  // Show skeleton loader during initial fetch
  if (loading) {
    return (
      <div className="flex flex-col gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-md"></div>
        ))}
      </div>
    );
  }

  // Sort newest → oldest (if createdAt exists)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="flex flex-col">
      {sortedPosts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
