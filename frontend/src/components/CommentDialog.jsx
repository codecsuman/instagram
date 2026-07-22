import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🆕 ADD THIS
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import api from "@/lib/api";
import { toast } from "sonner";
import { setSelectedPost, updateSinglePost } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const navigate = useNavigate(); // 🆕 ADD THIS
  const dispatch = useDispatch();
  const { selectedPost } = useSelector((state) => state.post);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setText("");
      setLoading(false);
      setCurrentImageIndex(0);
    }
  }, [open, selectedPost?._id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedPost?.comments?.length]);

  if (!selectedPost) return null;

  const comments = Array.isArray(selectedPost.comments)
    ? selectedPost.comments
    : [];

  const images = Array.isArray(selectedPost?.images)
    ? selectedPost.images
    : selectedPost?.image
      ? [selectedPost.image]
      : [];

  const sendCommentHandler = async () => {
    if (!text.trim() || loading) return;

    try {
      setLoading(true);

      const res = await api.post(`/post/${selectedPost._id}/comment`, {
        text: text.trim(),
      });

      if (res.data.success) {
        const newComment = res.data.comment;

        const updatedPost = {
          ...selectedPost,
          comments: [...comments, newComment],
        };

        dispatch(setSelectedPost(updatedPost));
        dispatch(updateSinglePost(updatedPost));

        toast.success("Comment added");
        setText("");
      } else {
        toast.error(res.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("❌ Add comment error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogChange = (isOpen) => {
    if (!isOpen) {
      setText("");
      setCurrentImageIndex(0);
    }
    setOpen(isOpen);
  };

  const goToPrevImage = () =>
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  const goToNextImage = () =>
    setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));

  // 🆕 Handle image click → navigate to author's profile
  const handleImageClick = () => {
    if (selectedPost?.author?._id) {
      navigate(`/profile/${selectedPost.author._id}`);
      setOpen(false); // Close dialog after navigation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-5xl p-0 flex flex-col overflow-hidden">
        <div className="flex flex-1 min-h-[500px]">
          {/* LEFT IMAGE CAROUSEL — CLICK TO GO TO PROFILE */}
          <div
            className="w-1/2 bg-black hidden md:block relative cursor-pointer"
            onClick={handleImageClick}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`post-${currentImageIndex}`}
                  className="w-full h-full object-contain bg-black"
                  onError={(e) => {
                    e.currentTarget.src = "/fallback.jpg";
                  }}
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevImage();
                      }}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full disabled:opacity-30 hover:bg-black/70 transition z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextImage();
                      }}
                      disabled={currentImageIndex === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full disabled:opacity-30 hover:bg-black/70 transition z-10"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Dot indicators */}
                    <div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition ${
                            idx === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Image counter */}
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedPost.author?.profilePicture} />
                  <AvatarFallback>
                    {selectedPost.author?.username?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                {selectedPost.author?._id ? (
                  <Link
                    to={`/profile/${selectedPost.author._id}`}
                    className="font-semibold text-xs hover:underline"
                  >
                    {selectedPost.author?.username || "Unknown"}
                  </Link>
                ) : (
                  <span className="font-semibold text-xs">
                    {selectedPost.author?.username || "Unknown"}
                  </span>
                )}
              </div>

              <MoreHorizontal className="cursor-pointer" />
            </div>

            {/* COMMENTS */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto max-h-[420px] p-4"
            >
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendCommentHandler();
                    }
                  }}
                />

                <Button
                  disabled={!text.trim() || loading}
                  onClick={sendCommentHandler}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
