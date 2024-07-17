import React, { useEffect, useState } from "react";

const Alert = ({ alert }) => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (alert.msg) {
      setShowAlert(true);
      // const timer = setTimeout(() => setShowAlert(false), 5000);
      // return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    showAlert && (
      <div className="contain-alert">
        <p className={`${alert.error ? "error-alert" : "valid-alert"}`}>
          {alert.msg}
        </p>
      </div>
    )
  );
};

export default Alert;
