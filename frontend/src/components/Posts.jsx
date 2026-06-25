import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  const posts = useSelector((state) => state.post.posts);

  // If posts is not an array yet, treat as loading state
  if (!Array.isArray(posts)) {
    return (
      <div className="flex flex-col gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 h-80 rounded-md"
          />
        ))}
      </div>
    );
  }

  // Empty feed state
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-sm">No posts available yet.</p>
      </div>
    );
  }

  // Sort newest -> oldest
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