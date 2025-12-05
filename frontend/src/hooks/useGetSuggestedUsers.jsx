// src/hooks/useGetSuggestedUsers.js

import { setSuggestedUsers } from "@/redux/authSlice";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const { user, suggestedUsers } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No user logged in → no suggested users
    if (!user?._id) {
      dispatch(setSuggestedUsers([]));
      return;
    }

    let isMounted = true;

    const fetchSuggestedUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get("/user/suggested");

        if (isMounted && res.data.success) {
          dispatch(setSuggestedUsers(res.data.users));
        }
      } catch (error) {
        console.log("❌ Error loading suggested users:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Always refresh on login OR account change
    fetchSuggestedUsers();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user?._id]);

  return { loading, suggestedUsers };
};

export default useGetSuggestedUsers;
