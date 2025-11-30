import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "../redux/postSlice";
import { clearAuthUser } from "../redux/authSlice";
import api from "../lib/api";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllPost = async () => {
      try {
        const res = await api.get("/api/v1/post/all", {
          signal: controller.signal,
        });

        if (res?.data?.success) {
          dispatch(setPosts(res.data.posts || []));
        }
      } catch (error) {
        // ✅ ignore canceled requests
        if (error.name === "CanceledError") return;

        // ✅ logout on 401
        if (error.response?.status === 401) {
          dispatch(clearAuthUser());
          return;
        }

        console.error("❌ Post fetch error:", error?.response?.data || error.message);
      }
    };

    fetchAllPost();
    return () => controller.abort();
  }, [dispatch]);
};

export default useGetAllPost;
