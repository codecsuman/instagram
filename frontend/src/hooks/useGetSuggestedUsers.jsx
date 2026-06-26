import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);
  const suggestedUsers = useSelector((state) => state.auth.suggestedUsers);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if no logged-in user, clear suggestions
    if (!userId) {
      dispatch(setSuggestedUsers([]));
      return;
    }

    const controller = new AbortController();

    const fetchSuggestedUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get("/user/suggested", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users || []));
        } else {
          dispatch(setSuggestedUsers([]));
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return; // request was cancelled on unmount, not a real error
        }
        console.error("❌ Error loading suggested users:", error);
        dispatch(setSuggestedUsers([]));
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();

    return () => {
      controller.abort();
    };
  }, [dispatch, userId]);

  return { loading, suggestedUsers };
};

export default useGetSuggestedUsers;