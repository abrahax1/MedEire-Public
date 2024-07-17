import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../constants";
import Navbar from "./Navbar";

const Sidebar = ({ user }) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("tokenAuthUser");
    navigate("/");
  };

  const toggleLogoutPopup = () => {
    setIsLogoutOpen(!isLogoutOpen);
  };

  return (
    <div className="contain__sidebar">
      <div className="contain__logo-MedEire">
        <img src={images.MedEire} />
      </div>

      <Navbar user={user} />

      <aside className="sidebar__user">
        <div className="logOut">
          <img src={images.logout} onClick={toggleLogoutPopup} />
          LogOut
          {/* <h4>LogOut</h4> */}
        </div>
      </aside>
      {isLogoutOpen && (
        <div className="logout-popup">
          <p>Are you sure you want to logout?</p>
          <div className="logout-buttons">
            <button onClick={handleLogout}>Yes</button>
            <button onClick={toggleLogoutPopup}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
