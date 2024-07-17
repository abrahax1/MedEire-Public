import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import DeletePopup from "../components/delete-popUp";
import {
  handleDate,
  handleTime,
  checkAvailability,
} from "../helpers/Date-Time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
const AppointmentURL = import.meta.env.VITE_Appointment_URL;

const UpdateAppointment = () => {
  const params = useParams();
  const { id } = params;
  const [msgServer, setMsgServer] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [role, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false); // Define state for showing the delete popup
  const [appointmentToDelete, setAppointmentToDelete] = useState(null); // Define state for storing the ID of the appointment to delete
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const setMessage = (message, timeout) => {
    setMsgServer(message);
    setTimeout(() => {
      setMsgServer("");
    }, timeout);
  };

  useEffect(() => {
    const getAppointment = async () => {
      try {
        const resp = await fetch(AppointmentURL, { headers });
        if (!resp.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await resp.json();
        setAppointments(data.appointments);
        setRoles(data.userRoles);
        setIsLoading(false);
      } catch (error) {
        setMessage("Error on fetching data", 5000);
      }
    };

    const allAllpointments = async () => {
      if (!editingAppointment.appointmentDate) {
        return;
      }

      const response = await fetch(
        `${AppointmentURL}allAppointments?doctorName=${encodeURIComponent(
          editingAppointment.doctorName
        )}&appointmentDate=${encodeURIComponent(
          editingAppointment.appointmentDate
        )}`,
        { headers }
      );
      const data = await response.json();

      if (data.appointmentTimes) {
        const availableTimes = timeOptions.filter(
          (time) => !data.appointmentTimes.includes(time)
        );
        setAvailableTimeOptions(availableTimes);
      }
    };

    // Removed function for checking availability (might be useful later)
    // const fetchData = async () => {
    //   const result = await checkAvailability(
    //     editingAppointment.doctorName,
    //     editingAppointment.appointmentDate,
    //     editingAppointment.appointmentTime,
    //     editingAppointment.id,
    //     AppointmentURL,
    //     headers,
    //     true
    //   );
    //   setAlert({ msg: result.msg, error: true });
    // };

    const fetchDoctors = async () => {
      const response = await fetch(`${AppointmentURL}doctors`, { headers });

      const data = await response.json();

      if (!data.doctors) {
        setAlert({ msg: data.msg, error: true });
      }

      setUsers(data.doctors);
    };

    getAppointment();
    allAllpointments();
    // fetchData();
    fetchDoctors();
  }, [
    id,
    refreshData,
    editingAppointment.appointmentDate,
    editingAppointment.appointmentTime,
    editingAppointment.doctorName,
  ]);

  const handleDelete = async (appointmentID) => {
    try {
      setShowDeletePopup(true);
      setAppointmentToDelete(appointmentID);
    } catch (error) {
      setMessage("Error on deleting data", 5000);
    }
  };

  const handleDeleteConfirmation = async (appointmentID) => {
    try {
      const url = `${AppointmentURL}${appointmentID}`;
      const resp = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify(editingAppointment),
      });

      if (!resp.ok) {
        throw new Error("Network response was not ok");
      }
      setMessage("Appointment deleted successfully", 10000);

      setShowDeletePopup(false);
      setShowEditForm(false);
      setRefreshData((prev) => !prev);
    } catch (error) {
      setMessage("Error on updating data", 5000);
    }
  };

  // Sets up the data required for editing an appointment
  const handleEdit = (appointment) => {
    // Extracts appointment date and time information
    const appointmentDate = new Date(appointment.appointmentDate);
    const appointmentDateValue = appointmentDate.toISOString().substring(0, 10);
    const hours = appointmentDate.getHours();
    const minutes = appointmentDate.getMinutes();
    const appointmentTimeValue = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    console.log(appointmentTimeValue)

    // Updates the editing appointment state with the fetched data
    setEditingAppointment({
      ...appointment,
      appointmentDate: appointmentDateValue,
      appointmentTime: appointmentTimeValue,
    });

    setShowEditForm(true);
    setAlert({});
  };

  const handleInputChange = (event) => {
    // Updates the editing appointment state with the new input value
    const { name, value } = event.target;
    setEditingAppointment((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const setAppointmentDate = (date) => {
    setEditingAppointment((prevState) => ({
      ...prevState,
      appointmentDate: date,
    }));
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const formResult = handleDate(selectedDate);
    setAppointmentDate(formResult.selectedDate);
    setAppointmentTime("");
    setError(formResult.error);
    setAlert({ msg: formResult.msg, error: formResult.error });
  };

  const setAppointmentTime = (time) => {
    console.log('time', time)
    setEditingAppointment((prevState) => ({
      ...prevState,
      appointmentTime: time,
    }));
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const formResult = handleTime(
      selectedTime,
      editingAppointment.appointmentDate,
      setAppointmentTime,
      setError,
      setAlert
    );
    setError(formResult.error);
    setAlert({ msg: formResult.msg, error: formResult.error });

    // Formats the selected time and updates the editing appointment 
    if (!formResult.error) {
      const timeParts = formResult.time.split(" ");
      const hoursMinutes = timeParts[0].split(":");
      const hours = parseInt(hoursMinutes[0]);
      const minutes = parseInt(hoursMinutes[1]);

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setEditingAppointment((prevState) => ({
        ...prevState,
        appointmentTime: formattedTime,
      }));
    }
  };

  const timeOptions = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  const [availableTimeOptions, setAvailableTimeOptions] = useState(timeOptions);

  const handleCancel = () => {
    setShowEditForm(false);
    setEditingAppointment({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const available = await checkAvailability(
      editingAppointment.doctorName,
      editingAppointment.appointmentDate,
      editingAppointment.appointmentTime,
      editingAppointment.id,
      AppointmentURL,
      headers,
      true
    );

    if (available.msg) {
      setAlert({ msg: available.msg, error: true });
      return;
    }

    try {
      const url = `${AppointmentURL}${editingAppointment.id}`;
      const resp = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(editingAppointment),
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (resp.status === 400) {
          setAlert({ msg: data.msg, error: true });
          return;
        } else {
          throw new Error("Network response was not ok");
        }
      }
      setMessage("Appointment updated successfully", 10000);
      setShowEditForm(false);
      setRefreshData((prev) => !prev);
    } catch (error) {
      setMessage("Error on updating data", 5000);
    }
  };

  return (
    <div>
      {msgServer && <h2>{msgServer}</h2>}
      {isLoading ? (
        <div></div>
      ) : (
        <div className="appointment_section">
          <h1 className="appointment_taital">Appointments</h1>
          <div className="container-appointment">
            {appointments.map((appointment) => (
              <div className="appointment_section_2" key={appointment.id}>
                <div className="appList" key={appointment.id}>
                  {showEditForm && appointment.id === editingAppointment.id ? (
                    <form onSubmit={handleSubmit}>
                      {<Alert alert={alert} />}
                      <label className="formbold-form-label">
                        Doctor
                        <select
                          type="text"
                          className="formbold-form-input"
                          name="doctorName"
                          value={editingAppointment.doctorName}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>
                            Select Doctor
                          </option>
                          {users.map((user) => {
                            return (
                              <option
                                key={user.id}
                                value={`${user.name} ${user.surname}`}
                              >{`${user.name} ${user.surname}`}</option>
                            );
                          })}
                        </select>
                      </label>

                      <label className="formbold-form-label">
                        Date
                        <input
                          className="formbold-form-input"
                          name="appointmentDate"
                          type="date"
                          value={editingAppointment.appointmentDate}
                          onChange={handleDateChange}
                        />
                      </label>

                      <label className="formbold-form-label">
                        Time
                        <div className="custom-time-picker">
                          <select
                            className="formbold-form-input"
                            name="appointmentTime"
                            value={editingAppointment.appointmentTime}
                            onChange={handleTimeChange}
                          >
                            <option value="" disabled>
                              Select Time
                            </option>
                            {availableTimeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <span className="custom-time-picker-icon">
                            <FontAwesomeIcon icon={faClock} />
                          </span>
                        </div>
                      </label>

                      <label className="formbold-form-label">
                        Triage
                        <select
                          type="form-control"
                          className="formbold-form-input"
                          name="triage"
                          value={editingAppointment.triage}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>
                            Select Triage
                          </option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </label>

                      <label className="formbold-form-label">Description</label>
                      <textarea
                        className="formbold-form-input"
                        name="description"
                        type="text"
                        value={editingAppointment.description}
                        onChange={handleInputChange}
                      />

                      <br />
                      <br />

                      <button className="formbold-btn edit-btn" type="submit">
                        Update Appointment
                      </button>
                      <br />
                      <br />
                      <button
                        className="formbold-btn cancel-btn"
                        type="button"
                        onClick={() => handleCancel()}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="placeHolder">
                      {(showDeletePopup === false ||
                        appointment.id !== appointmentToDelete) && (
                        <>
                          <label className="formbold-form-label">
                            Doctor
                            <div className="formbold-form-input">
                              {appointment.doctorName}
                            </div>
                          </label>

                          <label className="formbold-form-label">
                            Date
                            <div className="formbold-form-input">
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </div>
                          </label>

                          <label className="formbold-form-label">
                            Time
                            <div className="formbold-form-input">
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: false,
                              })}
                            </div>
                          </label>

                          <label className="formbold-form-label">
                            Triage
                            <div className="formbold-form-input">
                              {appointment.triage}
                            </div>
                          </label>

                          {role && role.some((role) => role.roleId === 2) && (
                            <label className="formbold-form-label">
                              Patient's PPS
                              <div className="formbold-form-input">
                                {appointment.user.pps}
                              </div>
                            </label>
                          )}

                          <label className="formbold-form-label">
                            Description
                          </label>
                          <textarea
                            className="formbold-form-input long"
                            readOnly
                            disabled
                            value={appointment.description}
                          ></textarea>

                          <br />
                          <br />
                          <button
                            className="formbold-btn"
                            onClick={() => handleEdit(appointment)}
                          >
                            Edit Appointment
                          </button>
                          <br />
                          <br />
                          <button
                            className="formbold-btn delete-btn"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            Delete Appointment
                          </button>
                        </>
                      )}
                      <DeletePopup
                        showPopup={
                          showDeletePopup &&
                          appointment.id === appointmentToDelete
                        }
                        onDelete={() =>
                          handleDeleteConfirmation(appointment.id)
                        }
                        onCancel={() => setShowDeletePopup(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateAppointment;
