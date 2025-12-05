import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user?._id) navigate("/", { replace: true });
  }, [user, navigate]);

  const changeEventHandler = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ---------------- VALIDATION ----------------
  const validateData = () => {
    if (!input.username.trim() || input.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(input.email)) {
      toast.error("Invalid email address");
      return false;
    }

    if (input.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // ---------------- SIGNUP ----------------
  const signupHandler = async (e) => {
    e.preventDefault();
    if (!validateData()) return;

    try {
      setLoading(true);

      const res = await api.post("/user/register", input);

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Account created successfully");

      setInput({ username: "", email: "", password: "" });

      navigate("/login"); // ✅ Correct line
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8 w-[350px]"
      >
        <div className="my-4 text-center">
          <h1 className="font-bold text-xl">LOGO</h1>
          <p className="text-sm">
            Signup to see photos & videos from your friends
          </p>
        </div>

        <div>
          <span className="font-medium">Username</span>
          <Input
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="my-2"
          />
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="my-2"
          />
        </div>

        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="my-2"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !input.username || !input.email || !input.password}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Please wait
            </>
          ) : (
            "Signup"
          )}
        </Button>

        <span className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
