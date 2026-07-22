import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Compass } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const ExplorePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchExplorePosts = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/explore/posts?page=${pageNum}&limit=24`);

      if (res.data.success) {
        if (pageNum === 1) {
          setPosts(res.data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(res.data.posts || [])]);
        }
        setHasMore(res.data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("EXPLORE ERROR:", error);
      toast.error("Failed to load explore posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplorePosts(1);
  }, [fetchExplorePosts]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchExplorePosts(page);
    }
  }, [page, fetchExplorePosts]);

  // Masonry-like layout: alternate between 1 large + 2 small patterns
  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < posts.length; i += 3) {
      const isEvenRow = Math.floor(i / 3) % 2 === 0;
      const group = posts.slice(i, i + 3);

      if (group.length === 3) {
        rows.push(
          <div key={i} className="grid grid-cols-3 gap-1 mb-1">
            {isEvenRow ? (
              <>
                <div className="col-span-2 row-span-2">
                  <ExploreCard post={group[0]} large />
                </div>
                <ExploreCard post={group[1]} />
                <ExploreCard post={group[2]} />
              </>
            ) : (
              <>
                <ExploreCard post={group[0]} />
                <div className="col-span-2 row-span-2">
                  <ExploreCard post={group[1]} large />
                </div>
                <ExploreCard post={group[2]} />
              </>
            )}
          </div>,
        );
      } else {
        rows.push(
          <div key={i} className="grid grid-cols-3 gap-1 mb-1">
            {group.map((post) => (
              <ExploreCard key={post._id} post={post} />
            ))}
          </div>,
        );
      }
    }
    return rows;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      {posts.length === 0 && !loading ? (
        <div className="text-center py-20">
          <Compass className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 text-lg">No posts to explore yet</p>
        </div>
      ) : (
        <div className="w-full">{renderGrid()}</div>
      )}

      {/* Loading / Load More */}
      <div ref={loaderRef} className="flex justify-center py-8">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-gray-400" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-400 text-sm">You're all caught up!</p>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------
   EXPLORE CARD COMPONENT
-------------------------------------------------- */
const ExploreCard = ({ post, large = false }) => {
  const navigate = useNavigate();

  // 🆕 Handle images array (backward compatible)
  const images = Array.isArray(post?.images)
    ? post.images
    : post?.image
      ? [post.image]
      : [];
  const hasMultipleImages = images.length > 1;

  return (
    <div
      onClick={() => navigate(`/profile/${post.author?._id}`)}
      className={`relative cursor-pointer group overflow-hidden bg-gray-100 ${
        large ? "h-full min-h-[300px]" : "aspect-square"
      }`}
    >
      <img
        src={images[0] || "/fallback.png"}
        alt="explore"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* 🆕 Multiple images indicator */}
      {hasMultipleImages && (
        <div className="absolute top-2 right-2 text-white drop-shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-5 text-white">
          <span className="flex items-center gap-1.5 font-bold text-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {post.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1.5 font-bold text-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
