import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  const posts = useSelector((state) => state.post.posts);

  const loading = posts === null;

  // Loading state
  if (loading) {
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

  // No posts state
  if (posts.length === 0) {
    return <p className="text-center text-gray-400 mt-10">No posts yet</p>;
  }

  // Sort newest → oldest
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
