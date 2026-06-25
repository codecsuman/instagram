import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setMessages, setLoading, setError } from "@/redux/chatSlice";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedChatUser } = useSelector((state) => state.chat);

  useEffect(() => {
    // If no user selected, clear messages
    if (!selectedChatUser?._id) {
      dispatch(setMessages([]));
      dispatch(setError(null));
      dispatch(setLoading(false));
      return;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const res = await api.get(`/message/all/${selectedChatUser._id}`);

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setMessages(res.data.messages || []));
        } else {
          dispatch(setMessages([]));
          dispatch(setError(res.data.message || "Failed to fetch messages"));
        }
      } catch (error) {
        if (!isMounted) return;

        dispatch(setMessages([]));
        dispatch(
          setError(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to fetch messages"
          )
        );
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedChatUser?._id, dispatch]);
};

export default useGetAllMessage;