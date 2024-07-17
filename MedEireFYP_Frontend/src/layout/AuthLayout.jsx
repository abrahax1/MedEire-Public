import React from "react";
import { Outlet, Link } from "react-router-dom";
import { images } from "../constants";

const AuthLayout = () => {
  return (
    <>
      <main className="contain">
        <div className="contain-img">
          <Link to="/">
            <img src={images.MedEire} className="img-logo" />
          </Link>
        </div>

        <div className="contain-form">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default AuthLayout;
