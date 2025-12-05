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

        if (isMounted && res?.data?.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.error("❌ Failed to load user profile:", error?.response?.data || error);
        if (isMounted) dispatch(setUserProfile(null));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, user?._id, dispatch]);

  return { loading };
};

export default useGetUserProfile;
