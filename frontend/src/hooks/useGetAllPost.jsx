import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setPosts } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const fetchAllPosts = async () => {
      // if user logged out, clear posts
      if (!user?._id) {
        dispatch(setPosts([]));
        return;
      }

      try {
        const res = await api.get("/post/all");

        if (!isMounted) return;

        if (res.data.success) {
          dispatch(setPosts(res.data.posts || []));
        } else {
          dispatch(setPosts([]));
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("❌ Error loading posts:", error);
        dispatch(setPosts([]));
      }
    };

    fetchAllPosts();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user?._id]);
};

export default useGetAllPost;