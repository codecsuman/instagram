import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setUserProfile } from "@/redux/authSlice";

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

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setUserProfile(res.data.user || null));
        } else {
          dispatch(setUserProfile(null));
        }
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "❌ Error loading user profile:",
          error?.response?.data?.message || error.message,
        );
        dispatch(setUserProfile(null));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, dispatch, user?._id]);

  return { loading };
};

export default useGetUserProfile;
