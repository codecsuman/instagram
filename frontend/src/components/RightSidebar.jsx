import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  // 🔥 fetch suggested users when sidebar loads
  useGetSuggestedUsers();

  // prevent render before auth is restored
  if (!user?._id) return null;

  return (
    <div
      className="
        hidden lg:block
        w-[320px]
        px-4
        py-8
        sticky top-0
        h-screen
        overflow-y-auto
      "
    >
      {/* USER INFO */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user._id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.profilePicture || ""} alt={user.username} />
            <AvatarFallback>
              {user.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col min-w-0">
          <Link
            to={`/profile/${user._id}`}
            className="font-semibold text-sm hover:underline truncate"
          >
            {user.username}
          </Link>

          <span className="text-gray-500 text-xs line-clamp-2">
            {user.bio?.trim() || "No bio yet"}
          </span>
        </div>
      </div>

      {/* SUGGESTED USERS */}
      <div className="mt-8">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default React.memo(RightSidebar);