import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMessages } from "../redux/chatSlice";
import { clearAuthUser } from "../redux/authSlice";
import api from "../lib/api";

const useGetAllMessage = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/v1/message/all/${userId}`, {
          signal: controller.signal,
        });

        if (res?.data?.success) {
          dispatch(setMessages(res.data.messages || []));
        }
      } catch (error) {

        // ✅ Ignore cancel
        if (error.name === "CanceledError") return;

        // ✅ Logout on auth failure
        if (error.response?.status === 401) {
          dispatch(clearAuthUser());
          return;
        }

        console.error("❌ Message fetch error:", error?.response?.data || error.message);
      }
    };

    fetchMessages();

    return () => controller.abort();
  }, [userId, dispatch]);
};

export default useGetAllMessage;
