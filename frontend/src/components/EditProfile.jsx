import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import api from "@/lib/api";
import { readFileAsDataURL } from "@/lib/utils";

const EditProfile = () => {
  const imageRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    bio: "",
    gender: "",
    profilePhotoFile: null,
    profilePhotoPreview: "",
  });

  useEffect(() => {
    if (user) {
      setInput({
        bio: user.bio || "",
        gender: user.gender || "",
        profilePhotoFile: null,
        profilePhotoPreview: user.profilePicture || "",
      });
    }
  }, [user]);

  // -----------------------
  // FILE UPLOAD
  // -----------------------
  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image");
    }

    const preview = await readFileAsDataURL(file);

    setInput((prev) => ({
      ...prev,
      profilePhotoFile: file,
      profilePhotoPreview: preview,
    }));
  };

  // -----------------------
  // SUBMIT
  // -----------------------
  const editProfileHandler = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append("bio", input.bio.trim());
    if (input.gender) formData.append("gender", input.gender);

    if (input.profilePhotoFile) {
      formData.append("profilePicture", input.profilePhotoFile);
    }

    try {
      setLoading(true);

      const res = await api.patch("/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success("Profile updated!");
        navigate(`/profile/${res.data.user._id}`);
      }
    } catch (error) {
      console.error("Profile update error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* PROFILE */}
        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={input.profilePhotoPreview} />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-xs text-gray-600">{input.bio || "Add a bio..."}</span>
            </div>
          </div>

          <input
            ref={imageRef}
            hidden
            type="file"
            accept="image/*"
            onChange={fileChangeHandler}
          />

          <Button
            onClick={() => imageRef.current.click()}
            className="bg-blue-500 hover:bg-blue-600 h-8"
          >
            Change Photo
          </Button>
        </div>

        {/* BIO */}
        <Textarea
          value={input.bio}
          placeholder="Write something about yourself..."
          onChange={(e) =>
            setInput((prev) => ({ ...prev, bio: e.target.value }))
          }
        />

        {/* GENDER */}
        <Select
          value={input.gender}
          onValueChange={(value) =>
            setInput((prev) => ({ ...prev, gender: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* SAVE */}
        <div className="flex justify-end">
          <Button
            onClick={editProfileHandler}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
