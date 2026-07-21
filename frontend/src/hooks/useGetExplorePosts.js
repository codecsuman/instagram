import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "@/lib/api";

const useGetExplorePosts = (page = 1) => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/explore/posts?page=${page}&limit=24`);

        if (res.data.success) {
          if (page === 1) {
            setPosts(res.data.posts || []);
          } else {
            setPosts((prev) => [...prev, ...(res.data.posts || [])]);
          }
          setHasMore(res.data.pagination?.hasMore || false);
        }
      } catch (error) {
        console.error("❌ Error loading explore posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, [page]);

  return { posts, loading, hasMore };
};

export default useGetExplorePosts;
