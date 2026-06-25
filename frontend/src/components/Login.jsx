import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import api from "@/lib/api";
import { setAuthUser } from "@/redux/authSlice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  // LOGIN HANDLER
  // --------------------------------------------------
  const loginHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/login", {
        email,
        password,
      });

      if (!res?.data?.success || !res?.data?.user) {
        toast.error(res?.data?.message || "Login failed");
        return;
      }

      dispatch(setAuthUser(res.data.user));
      toast.success(res.data.message || "Login successful");

      // reset form after successful login
      setInput({
        email: "",
        password: "",
      });

      // give redux-persist a moment
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("LOGIN FRONTEND ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login. Please try again.";

      toast.error(message);

      // clear only password
      setInput((prev) => ({
        ...prev,
        password: "",
      }));

      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-white">
      <form
        onSubmit={loginHandler}
        className="w-full max-w-[400px] rounded-xl border bg-white p-8 shadow-lg flex flex-col gap-5"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="font-bold text-2xl">LOGO</h1>
          <p className="text-sm text-gray-600 mt-1">Login to continue</p>
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
            autoComplete="email"
            onChange={changeEventHandler}
            placeholder="Enter your email"
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
            ref={passwordRef}
            type="password"
            name="password"
            value={input.password}
            autoComplete="current-password"
            onChange={changeEventHandler}
            placeholder="Enter your password"
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
            disabled={!input.email.trim() || !input.password}
            className="w-full"
          >
            Login
          </Button>
        )}

        {/* FOOTER */}
        <span className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;