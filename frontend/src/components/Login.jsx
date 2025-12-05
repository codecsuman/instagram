import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);

  // --------------------------------------------
  // Redirect if already logged in (safe version)
  // --------------------------------------------
  useEffect(() => {
    if (user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password) {
      toast.error("Please fill all fields");
      return;
    }

    // simple email validation
    if (!/\S+@\S+\.\S+/.test(input.email)) {
      toast.error("Invalid email");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/login", input);

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));

        toast.success(res.data.message || "Login successful!");

        // Wait a moment so redux persists correctly
        setTimeout(() => navigate("/", { replace: true }), 100);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Login failed. Try again.";

      toast.error(msg);

      // Reset password and focus again
      setInput((prev) => ({ ...prev, password: "" }));
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-8 min-w-[350px]"
      >
        <div className="my-4 text-center">
          <h1 className="font-bold text-xl">LOGO</h1>
          <p className="text-sm">Login to continue</p>
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            autoComplete="email"
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <span className="font-medium">Password</span>
          <Input
            ref={passwordRef}
            type="password"
            name="password"
            value={input.password}
            autoComplete="current-password"
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {loading ? (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!input.email || !input.password}
            className="w-full"
          >
            Login
          </Button>
        )}

        <span className="text-center text-sm">
          Don't have an account?{" "}
          <Link className="text-blue-600" to="/signup">
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
