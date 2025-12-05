import { setMessages, setLoading, setError } from "@/redux/chatSlice";
import api from "@/lib/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedChatUser } = useSelector((state) => state.chat);

  useEffect(() => {
    // No user selected → clear chat
    if (!selectedChatUser?._id) {
      dispatch(setMessages([]));
      return;
    }

    const userId = selectedChatUser._id;
    let isCancelled = false;

    const fetchAllMessage = async () => {
      try {
        dispatch(setLoading(true));

        const res = await api.get(`/message/all/${userId}`);

        if (!isCancelled && res?.data?.success) {
          dispatch(setMessages(res.data.messages));
        }

      } catch (error) {
        if (!isCancelled) {
          dispatch(
            setError(
              error?.response?.data?.message || "Failed to load messages"
            )
          );
        }
      } finally {
        if (!isCancelled) {
          dispatch(setLoading(false));
        }
      }
    };

    fetchAllMessage();

    return () => {
      isCancelled = true;
    };
  }, [selectedChatUser, dispatch]);
};

export default useGetAllMessage;
