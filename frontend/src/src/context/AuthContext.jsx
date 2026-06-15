import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");

    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  // The login response doesn't always include the latest profilePicture
  // (e.g. one set in a previous session). Fetch it from the user's
  // profile so navbar/avatars stay accurate after every login or reload.
  useEffect(() => {
    if (!user?.userId) return;

    let cancelled = false;

    api
      .get(`/api/users/${user.userId}`)
      .then((res) => {
        if (cancelled) return;
        const { profilePicture, username, bio } = res.data || {};
        setUser((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            profilePicture: profilePicture || prev.profilePicture,
            username: username ?? prev.username,
            bio: bio ?? prev.bio,
          };
          localStorage.setItem("user", JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {
        /* ignore - keep whatever we already have */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout }}>
      {}
      {}
      {children}
      {}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
