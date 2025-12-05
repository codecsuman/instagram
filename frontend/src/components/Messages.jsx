import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  // ✅ CORRECT SOCKET REFERENCE
  const socket = window.socketRef || null;

  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  const bottomRef = useRef(null);

  // Socket listener
  useGetRTM(socket);

  // Auto-scroll on new message
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [messages]);

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex flex-col items-center justify-center py-4 border-b">
        <Avatar className="h-20 w-20">
          <AvatarImage src={selectedUser?.profilePicture} />
          <AvatarFallback>
            {selectedUser?.username?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="font-semibold mt-1">{selectedUser?.username}</span>

        <Link to={`/profile/${selectedUser?._id}`}>
          <Button className="h-8 mt-2" variant="secondary">
            View profile
          </Button>
        </Link>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No messages yet — start chatting!
          </div>
        )}

        {messages.map((msg) => {
          const fromMe =
            String(msg.senderId) === String(user?._id);

          return (
            <div
              key={msg._id}
              className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 max-w-xs shadow-sm break-words rounded-lg ${
                  fromMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Messages;
