// src/hooks/useGetRTM.js

import { addMessage } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = (socket) => {
  const dispatch = useDispatch();
  const { selectedChatUser } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!socket) return;

    // Handle new message ONLY if it belongs to the current chat
    const handleNewMessage = (message) => {
      if (
        selectedChatUser &&
        (message.senderId === selectedChatUser._id ||
          message.receiverId === selectedChatUser._id)
      ) {
        dispatch(addMessage(message));
      }
    };

    // Register listener (safe)
    socket.on("newMessage", handleNewMessage);

    // Cleanup on unmount or chat switch
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedChatUser, dispatch]);
};

export default useGetRTM;
