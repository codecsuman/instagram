import { setPosts } from "@/redux/postSlice";
import api from "@/lib/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // refetch on login/logout

  useEffect(() => {
    let isMounted = true;

    const fetchAllPosts = async () => {
      try {
        const res = await api.get("/post/all");

        if (isMounted && res?.data?.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error("❌ Failed to fetch posts:", error?.response?.data || error);
      }
    };

    fetchAllPosts();

    return () => {
      isMounted = false;
    };
  }, [user, dispatch]);

};

export default useGetAllPost;
