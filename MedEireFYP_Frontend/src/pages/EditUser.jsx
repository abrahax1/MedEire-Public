import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Alert from "../components/Alert";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../components/delete-popUp";
import checkPassword from "../helpers/checkPassword";

const UserURL = import.meta.env.VITE_USER_URL;
const AppointmentURL = import.meta.env.VITE_Appointment_URL;

const EditUser = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const id = auth.id;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [alert, setAlert] = useState({});
  const [name, setName] = useState(auth.name);
  const [surname, setSurname] = useState(auth.surname);
  const [email, setEmail] = useState(auth.email);
  const [pps, setPPS] = useState(auth.pps);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [emailLabel, setEmailLabel] = useState([]);
  const [IDLabel, setIDLabel] = useState([]);
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (users.some((user) => user.id === auth.id)) {
      setEmailLabel("Employee Email");
      setIDLabel("Employee ID")
    } else {
      setEmailLabel("Email");
      setIDLabel("PPS")
    }
  }, [users]);

  useEffect(() => {
    setName(auth.name);
    setSurname(auth.surname);
    setEmail(auth.email);
    setPPS(auth.pps);

    const fetchDoctors = async () => {
      const response = await fetch(`${AppointmentURL}doctors`, { headers });

      const data = await response.json();

      if (!data.doctors) {
        setAlert({ msg: data.msg, error: true });
      }

      setUsers(data.doctors);
    };

    fetchDoctors()
  }, []);

  const handleCancel = () => {
    setShowEditForm(false);
    setName(auth.name);
    setSurname(auth.surname);
    setEmail(auth.email);
    setPPS(auth.pps);
    setPassword("");
    setConfirmPassword("");
    setAlert({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password) {
      const { msg, error } = checkPassword(password, confirmPassword);
      if (msg) {
        setAlert({ msg: msg, error: true });
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${UserURL}update/${auth.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          id,
          name,
          surname,
          email: email.toLowerCase(),
          password,
          confirmPassword,
          pps,
        }),
      });

      setIsLoading(false);
      const data = await response.json();

      if (response.status == 200) {
        setAlert({ msg: data.msg, error: false });
        setShowEditForm(!showEditForm);
      } else {
        setAlert({ msg: data.msg, error: true });
      }
    } catch {
      setAlert({ msg: "server error", error: true });
    }
  };

  const handleDelete = async () => {
    setAlert({});
    try {
      setShowDeletePopup(true);
    } catch (error) {
      setAlert({ msg: "Error on deleting data" });
    }
  };

  const handleDeleteConfirmation = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${UserURL}delete/${auth.id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (response.status === 200) {
        setAlert({ msg: data.msg, error: false });
        localStorage.clear();
        navigate("/");
      } else {
        setAlert({ msg: data.msg, error: true });
      }
    } catch {
      setAlert({ msg: "Error, Account not deleted", error: true });
    }
    setIsLoading(false);
  };

  const handleEdit = async () => {
    setAlert({});
    setPassword("");
    setConfirmPassword("");
    setShowEditForm(!showEditForm);
  };

  return (
    <div className="editUser_container">
      <h1 className="appointment_taital">Account Management</h1>
      <div className="editUser_appointment">
        {<Alert alert={alert} />}

        {showEditForm ? (
          <form>
            <label className="formbold-form-label">
              Name
              <input
                className="formbold-form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="formbold-form-label">
              Surname
              <input
                className="formbold-form-input"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </label>

            <label className="formbold-form-label">
            {emailLabel}
              <input
                className="formbold-form-input email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="formbold-form-label">
              {IDLabel}
              <input
                className="formbold-form-input"
                type="text"
                value={pps}
                onChange={(e) => setPPS(e.target.value)}
              />
            </label>

            <label className="formbold-form-label">
              Password
              <input
                className="formbold-form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <label className="formbold-form-label">
              Confirm Password
              <input
                className="formbold-form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          </form>
        ) : (
          <div>
            {showDeletePopup === false && (
              <div>
                <label className="formbold-form-label">
                  Name
                  <div className="formbold-form-input">{name}</div>
                </label>

                <label className="formbold-form-label">
                  Surname
                  <div className="formbold-form-input">{surname}</div>
                </label>

                <label className="formbold-form-label">
                {emailLabel}
                  <div className="formbold-form-input">{email}</div>
                </label>

                <label className="formbold-form-label">
                {IDLabel}
                  <div className="formbold-form-input">{pps}</div>
                </label>

                <button className="formbold-btn" onClick={handleEdit}>
                  Edit User
                </button>
                <br />
                <br />
                <button
                  className="formbold-btn delete-btn"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
              </div>
            )}
            <DeletePopup
              showPopup={showDeletePopup}
              onDelete={() => handleDeleteConfirmation()}
              onCancel={() => setShowDeletePopup(false)}
            />
          </div>
        )}
        {isLoading && !showEditForm && (
          <section id="chatApp" className="chatApp">
            <div className="chatApp__loaderWrapper">
              <div className="chatApp__loaderText">Loading...</div>
              <div className="chatApp__loader"></div>
            </div>
          </section>
        )}

        {!isLoading && showEditForm && (
          <div>
            <button
              className="formbold-btn edit-btn"
              type="button"
              onClick={handleSubmit}
            >
              Update
            </button>
            <br />
            <br />
            <button
              className="formbold-btn cancel-btn"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
        {!showEditForm && <div></div>}
      </div>
    </div>
  );
};

export default EditUser;
