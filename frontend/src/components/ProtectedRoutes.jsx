import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { setAuthUser, clearAuthUser } from "../redux/authSlice";

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {

    const validateSession = async () => {
      try {
        const res = await api.get("/api/v1/user/profile-check");
        dispatch(setAuthUser(res.data.user));
      } catch {
        dispatch(clearAuthUser());
        navigate("/login", { replace: true });
      }
    };

    if (!user) validateSession();

  }, [dispatch, navigate, user]);

  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoutes;
