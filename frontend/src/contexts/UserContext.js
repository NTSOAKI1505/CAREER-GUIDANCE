// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // optional: show loading until user is fetched
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // On mount, load token from localStorage and fetch current user from backend
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);

      // Fetch current user from backend
      const fetchUser = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          const data = await res.json();
          if (res.ok && data.user) {
            setUser(data.user);
            // Update localStorage in case user info changed
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.error("Failed to fetch current user:", err);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
