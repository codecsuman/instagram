import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile, clearAuthUser } from "../redux/authSlice";
import api from "../lib/api";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/api/v1/user/${userId}/profile`, {
          signal: controller.signal,
        });

        if (res?.data?.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {

        // ✅ Ignore cancellations
        if (error.name === "CanceledError") return;

        // ✅ If auth expired -> logout user
        if (error.response?.status === 401) {
          dispatch(clearAuthUser());
        }

        console.error("❌ Profile fetch error:", error?.response?.data || error.message);
      }
    };

    fetchUserProfile();

    return () => controller.abort();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
