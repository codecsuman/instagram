import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import {
  setNotifications,
  setUnreadCount,
  setNotificationsLoading,
} from "@/redux/rtnSlice";

const useGetNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?._id) {
      dispatch(setNotifications([]));
      dispatch(setUnreadCount(0));
      return;
    }

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        dispatch(setNotificationsLoading(true));

        const res = await api.get("/notification/all");

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setNotifications(res.data.notifications || []));
          dispatch(setUnreadCount(res.data.unreadCount || 0));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("❌ Error loading notifications:", error);
      } finally {
        if (isMounted) {
          dispatch(setNotificationsLoading(false));
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user?._id]);
};

export default useGetNotifications;
