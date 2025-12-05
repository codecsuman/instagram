import { addMessage } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = (socket) => {
  const dispatch = useDispatch();
  const { selectedChatUser } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!socket || !selectedChatUser?._id) return;

    const handleNewMessage = (message) => {
      if (
        message?.senderId === selectedChatUser._id ||
        message?.receiverId === selectedChatUser._id
      ) {
        dispatch(addMessage(message));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedChatUser, dispatch]);
};

export default useGetRTM;
