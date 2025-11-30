import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSuggestedUsers, clearAuthUser } from "../redux/authSlice";
import api from "../lib/api";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestedUsers = async () => {
      try {
        const res = await api.get("/api/v1/user/suggested", {
          signal: controller.signal,
        });

        if (res?.data?.success) {
          dispatch(setSuggestedUsers(res.data.users || []));
        }
      } catch (error) {

        // ✅ ignore canceled requests
        if (error.name === "CanceledError") return;

        // ✅ logout user if auth fails
        if (error.response?.status === 401) {
          dispatch(clearAuthUser());
          return;
        }

        console.error("❌ Suggested users error:", error?.response?.data || error.message);
      }
    };

    fetchSuggestedUsers();
    return () => controller.abort();
  }, [dispatch]);
};

export default useGetSuggestedUsers;
