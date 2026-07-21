import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { setSelectedChatUser, addMessage } from "@/redux/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode, Users } from "lucide-react";
import Messages from "./Messages";
import ConversationsList from "./ConversationsList";
import api from "@/lib/api";
import useGetRTM from "@/hooks/useGetRTM";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetConversations from "@/hooks/useGetConversations";
import { toast } from "sonner";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const suggestedUsers = useSelector(
    (state) => state.auth.suggestedUsers || [],
  );
  const selectedChatUser = useSelector((state) => state.chat.selectedChatUser);
  const onlineUsers = useSelector((state) => state.socket.onlineUsers || []);

  // real socket comes from App.jsx
  const socket = window._socket || null;

  // fetch conversations list
  useGetConversations();

  // fetch messages when selected user changes
  useGetAllMessage();

  // listen for real-time incoming messages
  useGetRTM(socket);

  // ------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------
  const sendMessageHandler = async (receiverId) => {
    const trimmedMessage = textMessage.trim();
    if (!trimmedMessage || !receiverId || sending) return;

    try {
      setSending(true);

      const res = await api.post(`/message/send/${receiverId}`, {
        textMessage: trimmedMessage,
      });

      if (res.data.success) {
        // instantly update sender UI
        dispatch(addMessage(res.data.newMessage));
        setTextMessage("");
      }
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      {/* LEFT SIDEBAR - CONVERSATIONS */}
      <section className="w-full md:w-[320px] border-r border-gray-300 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-300 flex items-center justify-between">
          <h1 className="font-bold text-xl">{user?.username || "Messages"}</h1>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="New message"
          >
            <Users size={20} />
          </button>
        </div>

        {/* Toggle between Conversations and Suggested Users */}
        {showUsers ? (
          <>
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Suggested
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map((u) => {
                  const isOnline = onlineUsers.includes(u._id);
                  const isSelected = selectedChatUser?._id === u._id;

                  return (
                    <div
                      key={u._id}
                      onClick={() => {
                        dispatch(setSelectedChatUser(u));
                        setShowUsers(false);
                      }}
                      className={`flex gap-3 items-center p-3 cursor-pointer transition ${
                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={u.profilePicture} />
                        <AvatarFallback>
                          {u?.username?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {u.username}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isOnline ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {isOnline ? "online" : "offline"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No users available
                </div>
              )}
            </div>
          </>
        ) : (
          <ConversationsList />
        )}
      </section>

      {/* RIGHT CHAT WINDOW */}
      {selectedChatUser ? (
        <section className="flex-1 flex flex-col h-full">
          {/* TOP BAR */}
          <div className="flex gap-3 items-center px-4 py-3 border-b border-gray-300 bg-white sticky top-0 z-10">
            <Avatar>
              <AvatarImage src={selectedChatUser.profilePicture} />
              <AvatarFallback>
                {selectedChatUser?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-medium">{selectedChatUser.username}</span>
              <span className="text-xs text-gray-500">
                {onlineUsers.includes(selectedChatUser._id)
                  ? "online"
                  : "offline"}
              </span>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 min-h-0">
            <Messages selectedUser={selectedChatUser} />
          </div>

          {/* INPUT BAR */}
          <div className="flex items-center p-4 border-t border-gray-300 gap-2">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessageHandler(selectedChatUser._id);
                }
              }}
              type="text"
              className="flex-1 focus-visible:ring-transparent"
              placeholder="Message..."
            />

            <Button
              onClick={() => sendMessageHandler(selectedChatUser._id)}
              disabled={!textMessage.trim() || sending}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </section>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-1 flex-col items-center justify-center">
          <MessageCircleCode className="w-24 h-24 mb-4 text-gray-400" />
          <h1 className="font-medium text-lg">Your messages</h1>
          <span className="text-gray-500 text-sm">
            Select someone to start chatting.
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
