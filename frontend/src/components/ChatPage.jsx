import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { setSelectedChatUser, addMessage } from "@/redux/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import api from "@/lib/api";
import useGetRTM from "@/hooks/useGetRTM";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const dispatch = useDispatch();

  const { user, suggestedUsers } = useSelector((state) => state.auth);
  const { selectedChatUser } = useSelector((state) => state.chat);
  const { onlineUsers, socket } = useSelector((state) => state.socket);   // ✅ Clean

  // Realtime listener
  useGetRTM(socket);

  // SEND MESSAGE
  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await api.post(`/message/send/${receiverId}`, {
        textMessage,
      });

      if (res.data.success) {
        dispatch(addMessage(res.data.newMessage));

        socket?.emit("sendMessage", {
          receiverId,
          message: res.data.newMessage,
        });

        setTextMessage("");
      }
    } catch (error) {
      console.log("SEND ERR:", error);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* LEFT USER LIST */}
      <section className="w-full md:w-1/4 my-8">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />

        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((u) => {
            const isOnline = onlineUsers.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => dispatch(setSelectedChatUser(u))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={u.profilePicture} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-medium">{u.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT CHAT WINDOW */}
      {selectedChatUser ? (
        <section className="flex-1 border-l border-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b bg-white sticky top-0 z-10">
            <Avatar>
              <AvatarImage src={selectedChatUser.profilePicture} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span>{selectedChatUser.username}</span>
          </div>

          <Messages selectedUser={selectedChatUser} />

          <div className="flex items-center p-4 border-t">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="flex-1 mr-2"
              placeholder="Message..."
            />
            <Button onClick={() => sendMessageHandler(selectedChatUser._id)}>
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Select someone to start chatting.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
