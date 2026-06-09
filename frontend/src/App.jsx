import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      {}

      <BrowserRouter>
        {}

        <Toaster position="top-right" />
        {}

        <Routes>
          <Route path="/login" element={<Login />} />
          {}

          <Route path="/register" element={<Register />} />
          {}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Feed />
              </ProtectedRoute>
            }
          />
          {}

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            }
          />
          {}
          {}

          <Route path="*" element={<Navigate to="/" />} />
          {}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
