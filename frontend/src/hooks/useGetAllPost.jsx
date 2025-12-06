import { setPosts } from "@/redux/postSlice";
import api from "@/lib/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // reload posts if user changes

  useEffect(() => {
    let isMounted = true;

    const fetchAllPosts = async () => {
      try {
        const res = await api.get("/post/all");

        if (isMounted && res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log("❌ Error loading posts:", error);
      }
    };

    fetchAllPosts();

    // Cleanup to avoid state update after unmount
    return () => {
      isMounted = false;
    };
  }, [dispatch, user]); // 🔥 refetch when user logs in OR logs out
};

export default useGetAllPost;
