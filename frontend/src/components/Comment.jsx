import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Comment = ({ comment }) => {
  if (!comment) return null;

  const {
    author = {},
    text = "",
    createdAt,
  } = comment;

  const username = author.username || "Unknown";
  const profileImage = author.profilePicture || "";
  const fallback = username.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="my-2">
      <div className="flex gap-3 items-start">

        <Avatar className="w-10 h-10">
          <AvatarImage src={profileImage} alt={username} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col leading-tight break-words w-full">

          <Link to={`/profile/${author._id}`}>
            <span className="text-sm font-bold hover:underline">
              {username}
            </span>
          </Link>

          <span className="text-sm text-gray-700 whitespace-pre-wrap">
            {text}
          </span>

          <span className="text-xs text-gray-500 mt-1">
            {createdAt ? dayjs(createdAt).fromNow() : ""}
          </span>

        </div>
      </div>
    </div>
  );
};

export default Comment;
