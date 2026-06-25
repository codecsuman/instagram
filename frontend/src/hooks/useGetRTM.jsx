import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/redux/chatSlice";

const useGetRTM = (socket) => {
  const dispatch = useDispatch();
  const { selectedChatUser } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!socket || !selectedChatUser?._id) return;

    const handleNewMessage = (message) => {
      if (!message) return;

      const senderId =
        typeof message.senderId === "object"
          ? message.senderId?._id
          : message.senderId;

      const receiverId =
        typeof message.receiverId === "object"
          ? message.receiverId?._id
          : message.receiverId;

      const belongsToCurrentChat =
        senderId?.toString() === selectedChatUser._id.toString() ||
        receiverId?.toString() === selectedChatUser._id.toString();

      if (belongsToCurrentChat) {
        dispatch(addMessage(message));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedChatUser?._id, dispatch]);
};

export default useGetRTM;