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
  if (!user) return <Navigate to="/login" />;
  return children;
}

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#f1f1f3",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#0d0d1a" },
            },
            error: { iconTheme: { primary: "#f43f5e", secondary: "#0d0d1a" } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WithNav>
                  <Feed />
                </WithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <WithNav>
                  <Profile />
                </WithNav>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
