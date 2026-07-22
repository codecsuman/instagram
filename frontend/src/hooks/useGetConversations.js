import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setConversations, setConversationsLoading } from "@/redux/chatSlice";

const useGetConversations = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?._id) {
      dispatch(setConversations([]));
      return;
    }

    let isMounted = true;

    const fetchConversations = async () => {
      try {
        dispatch(setConversationsLoading(true));

        const res = await api.get("/conversation/all");

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setConversations(res.data.conversations || []));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("❌ Error loading conversations:", error);
      } finally {
        if (isMounted) {
          dispatch(setConversationsLoading(false));
        }
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user?._id]);
};

export default useGetConversations;
