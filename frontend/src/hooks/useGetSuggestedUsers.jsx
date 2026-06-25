import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const { user, suggestedUsers } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if no logged-in user, clear suggestions
    if (!user?._id) {
      dispatch(setSuggestedUsers([]));
      return;
    }

    let isMounted = true;

    const fetchSuggestedUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get("/user/suggested");

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users || []));
        } else {
          dispatch(setSuggestedUsers([]));
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("❌ Error loading suggested users:", error);
        dispatch(setSuggestedUsers([]));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestedUsers();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user?._id]);

  return { loading, suggestedUsers };
};

export default useGetSuggestedUsers;