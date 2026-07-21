import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setConversations, setConversationsLoading } from "@/redux/chatSlice";

const useGetConversations = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    if (!userId) {
      dispatch(setConversations([]));
      return;
    }

    const controller = new AbortController();

    const fetchConversations = async () => {
      try {
        dispatch(setConversationsLoading(true));

        const res = await api.get("/conversation/all", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(setConversations(res.data.conversations || []));
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return;
        }
        console.error("❌ Error loading conversations:", error);
      } finally {
        dispatch(setConversationsLoading(false));
      }
    };

    fetchConversations();

    return () => {
      controller.abort();
    };
  }, [dispatch, userId]);
};

export default useGetConversations;
