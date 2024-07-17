import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";

const AreaPrivate = () => {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!auth.id) {
  //     navigate("/");
  //   }
  // }, [auth]);

  if (loading) return "Loading";
  return (
    <>
      {auth.id ? (
        <div className="contain__area-private">
          <div className="sidebar__area-private">
            <Sidebar user={auth} />
          </div>

          <main className="contain__main--outlet">
            <Outlet user={auth} />
          </main>
        </div>
      ) : (
        navigate("/")
      )}
    </>
  );
};

export default AreaPrivate;
