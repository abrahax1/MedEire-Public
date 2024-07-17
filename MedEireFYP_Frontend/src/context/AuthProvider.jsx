import React, { useState, useEffect, createContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
const UserURL = import.meta.env.VITE_USER_URL;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userAuth = async () => {
      const token = localStorage.getItem("tokenAuthUser");
      if (!token) {
        setLoading(false);
        return;
      }

      let requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const resp = await fetch(`${UserURL}profile`, requestOptions);
        const result = await resp.json();
        setAuth(result);
        navigate("/home");
      } catch (error) {
        console.log(error.message);
        setAuth({});
      } finally {
        setLoading(false);
      }
    };
    userAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({
          setAuth,
          auth,
          loading,
        }),
        [setAuth, auth, loading]
      )}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

export default AuthContext;
