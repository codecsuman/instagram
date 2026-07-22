import { useCallback } from "react";
import { useDispatch } from "react-redux";
import api from "@/lib/api";
import { markAllRead } from "@/redux/rtnSlice";
import { toast } from "sonner";

const useMarkNotificationsRead = () => {
  const dispatch = useDispatch();

  const markAsRead = useCallback(async () => {
    try {
      const res = await api.patch("/notification/read");

      if (res.data.success) {
        dispatch(markAllRead());
      }
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  }, [dispatch]);

  return { markAsRead };
};

export default useMarkNotificationsRead;
