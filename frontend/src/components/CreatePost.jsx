import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);

  // ---------------------------------------
  // FILE SELECT
  // ---------------------------------------
  const fileChangeHandler = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    setFile(uploadedFile);
    const preview = await readFileAsDataURL(uploadedFile);
    setImagePreview(preview);
  };

  // ---------------------------------------
  // CREATE POST
  // ---------------------------------------
  const createPostHandler = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await api.post("/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        const newPost = res.data.post;
        dispatch(setPosts([newPost, ...posts]));

        toast.success("Post created!");
        setCaption("");
        setImagePreview("");
        setFile(null);
        setOpen(false);
      }
    } catch (error) {
      console.error("Post upload failed:", error?.response?.data || error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // CLEANUP ON DIALOG CLOSE
  // ---------------------------------------
  const handleDialogChange = (isOpen) => {
    if (!isOpen) {
      setCaption("");
      setImagePreview("");
      setFile(null);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        {/* ✅ ACCESSIBILITY FIX */}
        <DialogTitle className="hidden">Create Post Dialog</DialogTitle>

        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>

        {/* USER */}
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-xs font-semibold">{user?.username}</h1>
            <span className="text-xs text-gray-600">Post something...</span>
          </div>
        </div>

        {/* CAPTION */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="border-none focus-visible:ring-transparent"
        />

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="h-64 flex justify-center">
            <img
              src={imagePreview}
              alt="preview"
              className="object-cover w-full rounded-md"
            />
          </div>
        )}

        {/* FILE INPUT */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={fileChangeHandler}
          hidden
        />

        <Button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="mx-auto bg-blue-500 hover:bg-blue-600"
        >
          Select from computer
        </Button>

        {/* SUBMIT */}
        {imagePreview &&
          (loading ? (
            <Button className="w-full">
              <Loader2 className="animate-spin mr-2" /> Uploading...
            </Button>
          ) : (
            <Button onClick={createPostHandler} className="w-full">
              Post
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
