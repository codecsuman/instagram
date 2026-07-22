import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setMessages, setLoading } from "@/redux/chatSlice";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  const dispatch = useDispatch();

  const { messages, loading } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  // FIXED: Use window._socket instead of Redux socket (avoids serialization error)
  const socket = window._socket || null;

  const bottomRef = useRef(null);

  // Real-time listener
  useGetRTM(socket);

  // Load messages when chat user changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;

      try {
        dispatch(setLoading(true));

        const res = await api.get(`/message/all/${selectedUser._id}`);

        if (res.data.success) {
          dispatch(setMessages(res.data.messages || []));
        }
      } catch (error) {
        console.error("GET MESSAGES ERROR:", error);
        dispatch(setMessages([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMessages();
  }, [selectedUser?._id, dispatch]);

  // Auto scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* TOP BAR */}
      <div className="flex flex-col items-center justify-center py-4 border-b">
        <Avatar className="h-20 w-20">
          <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
          <AvatarFallback>
            {selectedUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <span className="font-semibold mt-1">{selectedUser?.username}</span>

        <Link to={`/profile/${selectedUser?._id}`}>
          <Button className="h-8 mt-2" variant="secondary">
            View profile
          </Button>
        </Link>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading && (
          <div className="text-center text-gray-500 mt-10">
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No messages yet — start the conversation!
          </div>
        )}

        {!loading &&
          messages.map((msg) => {
            const senderId =
              typeof msg.senderId === "object"
                ? msg.senderId?._id
                : msg.senderId;

            const fromMe = senderId?.toString() === user?._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words shadow-sm ${
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
