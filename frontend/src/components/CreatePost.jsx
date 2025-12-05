import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
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
  const imageRef = useRef();
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);

  // ---------------------------------------
  // FILE CHANGE
  // ---------------------------------------
  const fileChangeHandler = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setFile(uploadedFile);
    const dataUrl = await readFileAsDataURL(uploadedFile);
    setImagePreview(dataUrl);
  };

  // ---------------------------------------
  // CREATE POST
  // ---------------------------------------
  const createPostHandler = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await api.post("/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const newPost = res.data.post;

        // 🔥 FIX — update FEED correctly
        dispatch(setPosts([newPost, ...posts]));

        toast.success("Post created successfully");

        // cleanup
        setCaption("");
        setImagePreview("");
        setFile(null);

        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // DIALOG CLOSE CLEANUP
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
        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>

        {/* USER INFO */}
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Post something...</span>
          </div>
        </div>

        {/* CAPTION */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
        />

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="preview"
              className="object-cover h-full w-full rounded-md"
            />
          </div>
        )}

        {/* FILE SELECT */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={fileChangeHandler}
          className="hidden"
        />

        <Button
          onClick={() => imageRef.current.click()}
          className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]"
        >
          Select from computer
        </Button>

        {/* POST BUTTON */}
        {imagePreview &&
          (loading ? (
            <Button className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
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
