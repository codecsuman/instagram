// src/hooks/useGetUserProfile.js

import { setUserProfile } from "@/redux/authSlice";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      dispatch(setUserProfile(null));
      return;
    }

    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/user/${userId}/profile`);

        if (isMounted && res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log("❌ Error loading user profile:", error);
        if (isMounted) dispatch(setUserProfile(null));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();

    // Refetch profile when logged-in user changes (optional but correct)
    return () => {
      isMounted = false;
    };
  }, [userId, dispatch, user?._id]);

  return { loading };
};

export default useGetUserProfile;
