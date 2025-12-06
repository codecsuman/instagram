import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  // Prevent flicker on refresh
  if (!user) return null;

  return (
    <div className="
      hidden lg:block               /* hide on small screens */
      w-[300px] 
      pr-10 
      py-10 
      sticky top-0                 /* better than fixed */
      h-screen 
      overflow-y-auto
    ">
      {/* USER INFO */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage src={user.profilePicture} alt="profile" />
            <AvatarFallback>
              {user.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col">
          <Link 
            to={`/profile/${user._id}`} 
            className="font-semibold text-sm"
          >
            {user.username}
          </Link>

          <span className="text-gray-600 text-xs line-clamp-2">
            {user.bio || "Bio here..."}
          </span>
        </div>
      </div>

      {/* SUGGESTED USERS */}
      <div className="mt-6">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default React.memo(RightSidebar);
