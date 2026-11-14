import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";

export default function AppRoutes() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/chat" replace /> : <Register />} />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
