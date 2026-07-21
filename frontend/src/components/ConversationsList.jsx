import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedChatUser } from "@/redux/chatSlice";
import api from "@/lib/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ConversationsList = () => {
  const dispatch = useDispatch();
  const { conversations, conversationsLoading } = useSelector(
    (state) => state.chat,
  );
  const onlineUsers = useSelector((state) => state.socket.onlineUsers || []);
  const selectedChatUser = useSelector((state) => state.chat.selectedChatUser);

  return (
    <div className="overflow-y-auto flex-1">
      {conversationsLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-2 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center mt-10">
          <p className="font-medium mb-1">No conversations yet</p>
          <p className="text-xs">Start messaging from suggested users</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const otherUser = conv.otherUser;
          if (!otherUser) return null;

          const isOnline = onlineUsers.includes(otherUser._id);
          const isSelected = selectedChatUser?._id === otherUser._id;
          const lastMsg = conv.lastMessage;

          return (
            <div
              key={conv._id}
              onClick={() => dispatch(setSelectedChatUser(otherUser))}
              className={`flex gap-3 items-center p-3 cursor-pointer transition ${
                isSelected ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser.profilePicture} />
                  <AvatarFallback>
                    {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Online dot */}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-sm truncate">
                  {otherUser.username}
                </span>

                <span className="text-xs text-gray-500 truncate">
                  {lastMsg
                    ? `${lastMsg.senderId?.username === otherUser.username ? "" : "You: "}${lastMsg.text}`
                    : "No messages yet"}
                </span>
              </div>

              {lastMsg && (
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {dayjs(lastMsg.createdAt).fromNow(true)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationsList;
