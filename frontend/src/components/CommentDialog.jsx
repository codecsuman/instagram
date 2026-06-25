import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import api from "@/lib/api";
import { toast } from "sonner";
import { setSelectedPost, updateSinglePost } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { selectedPost } = useSelector((state) => state.post);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // reset input whenever dialog closes or post changes
  useEffect(() => {
    if (!open) {
      setText("");
      setLoading(false);
    }
  }, [open, selectedPost?._id]);

  // auto-scroll to latest comment
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedPost?.comments?.length]);

  if (!selectedPost) return null;

  const comments = Array.isArray(selectedPost.comments)
    ? selectedPost.comments
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

        // update selected post modal state
        dispatch(setSelectedPost(updatedPost));

        // update same post in feed
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
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-5xl p-0 flex flex-col overflow-hidden">
        <div className="flex flex-1 min-h-[500px]">
          {/* LEFT IMAGE */}
          <div className="w-1/2 bg-black hidden md:block">
            <img
              src={selectedPost.image}
              alt="post"
              className="w-full h-full object-contain bg-black"
              onError={(e) => {
                e.currentTarget.src = "/fallback.jpg";
              }}
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedPost.author?.profilePicture} />
                  <AvatarFallback>
                    {selectedPost.author?.username?.charAt(0)?.toUpperCase() || "U"}
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