import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import api from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  // --------------------------------------------------
  // REDIRECT IF ALREADY LOGGED IN
  // --------------------------------------------------
  useEffect(() => {
    if (user?._id) {
      navigate("/", { replace: true });
    }
  }, [user?._id, navigate]);

  // --------------------------------------------------
  // HANDLE INPUT CHANGE
  // --------------------------------------------------
  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const validateData = () => {
    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!username) {
      toast.error("Username is required");
      return false;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }

    if (username.length > 30) {
      toast.error("Username must be less than 30 characters");
      return false;
    }

    if (!/^[a-z0-9._]+$/.test(username)) {
      toast.error(
        "Username can only contain lowercase letters, numbers, dot and underscore"
      );
      return false;
    }

    if (!email) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // SIGNUP HANDLER
  // --------------------------------------------------
  const signupHandler = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!validateData()) return;

    try {
      setLoading(true);

      const payload = {
        username: input.username.trim().toLowerCase(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      };

      const res = await api.post("/user/register", payload);

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Signup failed");
        return;
      }

      toast.success(res.data.message || "Account created successfully");

      setInput({
        username: "",
        email: "",
        password: "",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("SIGNUP FRONTEND ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong during signup";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-white">
      <form
        onSubmit={signupHandler}
        className="w-full max-w-[400px] rounded-xl border bg-white p-8 shadow-lg flex flex-col gap-5"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="font-bold text-2xl">LOGO</h1>
          <p className="text-sm text-gray-600 mt-1">
            Signup to see photos & videos from your friends
          </p>
        </div>

        {/* USERNAME */}
        <div>
          <label htmlFor="username" className="font-medium text-sm">
            Username
          </label>
          <Input
            id="username"
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Enter your username"
            autoComplete="username"
            className="my-2 focus-visible:ring-transparent"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="font-medium text-sm">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter your email"
            autoComplete="email"
            className="my-2 focus-visible:ring-transparent"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="font-medium text-sm">
            Password
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter your password"
            autoComplete="new-password"
            className="my-2 focus-visible:ring-transparent"
          />
        </div>

        {/* BUTTON */}
        {loading ? (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={
              !input.username.trim() || !input.email.trim() || !input.password
            }
            className="w-full"
          >
            Signup
          </Button>
        )}

        {/* FOOTER */}
        <span className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;