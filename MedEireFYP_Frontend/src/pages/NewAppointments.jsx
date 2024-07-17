import React, { useState, useEffect } from "react";
import Alert from "../components/Alert";
import {
  handleDate,
  handleTime,
  checkAvailability,
} from "../helpers/Date-Time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../hooks/useAuth";

const AppointmentURL = import.meta.env.VITE_Appointment_URL;

const NewAppointment = () => {
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
  const { auth } = useAuth();
  const [disablePPSInput, setDisablePPSInput] = useState(false);
  const [ppsList, setPPSList] = useState([]);
  const [pps, setPPS] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [triage, setTriage] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (auth && auth.userRoles.length > 1) {

      // Check role to either disable PPS (from the form) or show list of PPS
      if (auth.userRoles.some((role) => role.roleId === 2)) {
        setDisablePPSInput(false);

        const getPPS = async () => {
          const response = await fetch(`${AppointmentURL}patients`, {
            headers,
          });
          const data = await response.json();

          if (data.patients) {
            setPPSList(
              data.patients.map((patient) => ({
                id: patient.id,
                pps: patient.pps,
                name: patient.name,
                surname: patient.surname,
              }))
            );
          }
        };

        getPPS();
      } else {
        setDisablePPSInput(true);
        setPPS(auth.pps);
      }
    } else {
      setDisablePPSInput(true);
      setPPS(auth.pps);
    }

    const allAllpointments = async () => {
      if (!appointmentDate) {
        return;
      }

      const response = await fetch(
        `${AppointmentURL}allAppointments?doctorName=${encodeURIComponent(
          doctorName
        )}&appointmentDate=${encodeURIComponent(appointmentDate)}`,
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
    //   if (!doctorName || !appointmentDate || !appointmentTime){
    //     return
    //   }

    //   const result = await checkAvailability(doctorName, appointmentDate, appointmentTime, pps, AppointmentURL, headers, false)
    //   setAlert({msg: result.msg, error: true});
    // };

    const fetchDoctors = async () => {
      const response = await fetch(`${AppointmentURL}doctors`, { headers });
      const data = await response.json();

      if (!data.doctors) {
        setAlert({ msg: data.msg, error: true });
      }

      setUsers(data.doctors);
    };

    fetchDoctors();
    allAllpointments();
    // fetchData();
  }, [doctorName, appointmentDate, appointmentTime, disablePPSInput]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const formResult = handleDate(selectedDate);
    setAppointmentDate(formResult.selectedDate);
    setError(formResult.error);
    setAlert({ msg: formResult.msg, error: formResult.error });
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const formResult = handleTime(
      selectedTime,
      appointmentDate,
      setAppointmentTime,
      setError,
      setAlert
    );
    setError(formResult.error);
    setAlert({ msg: formResult.msg, error: formResult.error });

    if (!formResult.error) {
      const timeParts = formResult.time.split(" ");
      const hoursMinutes = timeParts[0].split(":");
      const hours = parseInt(hoursMinutes[0]);
      const minutes = parseInt(hoursMinutes[1]);

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setAppointmentTime(formattedTime);
    }
  };

  const [availableTimeOptions, setAvailableTimeOptions] = useState(timeOptions);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new Date object for the current date and time
    const now = new Date();

    if (
      !pps ||
      !appointmentDate ||
      !appointmentTime ||
      !triage ||
      !doctorName ||
      !description
    ) {
      setError(true);
      setAlert({ msg: "Type the appointment information", error: true });
      return;
    }

    const available = await checkAvailability(
      doctorName,
      appointmentDate,
      appointmentTime,
      pps,
      AppointmentURL,
      headers,
      false
    );

    if (available.msg) {
      setAlert({ msg: available.msg, error: true });
      return;
    }
    // Create a new Date object for the selected date and time
    const [year, month, day] = appointmentDate.split("-");
    const [hours, minutes] = appointmentTime.split(":");

    const selectedDateTime = new Date(
      year,
      parseInt(month) - 1,
      day,
      hours,
      minutes
    );

    // Check if the selected date and time is in the past
    if (selectedDateTime < now) {
      setError(true);
      setAlert({ msg: "Selected date and time is in the past", error: true });
      return;
    }

    const raw = JSON.stringify({
      pps: pps,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      triage: triage,
      doctorName: doctorName,
      description: description,
    });

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
    };

    try {
      const response = await fetch(`${AppointmentURL}`, requestOptions);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const result = await response.json();

      if (!result.msg) {
        setAlert({
          msg: "Appointment created, check your email",
          error: false,
        });
        setPPS("");
        setAppointmentDate("");
        setAppointmentTime("");
        setTriage("");
        setDoctorName("");
        setDescription("");
      } else if (result.error) {
        setAlert({
          msg: result.msg,
          error: true,
        });
      } else {
        setAlert({
          msg: `Appointment created: ${result.msg}`,
          error: false,
        });
      }
    } catch (error) {
      setAlert({
        msg: "server error",
        error: true,
      });
    }
  };

  return (
    <div className="container-app">
      <div className="formbold-main-wrapper">
        <form className="appointmentForm" onSubmit={handleSubmit}>
          <h1 className="appointment_taital">Schedule</h1>
          <div className="formbold-mb-5">
            <label className="formbold-form-label">Patient's PPS</label>
            {disablePPSInput ? (
              <input
                type="text"
                className="formbold-form-input"
                placeholder="Enter user PPS"
                disabled={disablePPSInput}
                value={pps}
                onChange={(e) => {
                  setPPS(e.target.value), setError(false), setAlert({});
                }}
              />
            ) : (
              <select
                className="formbold-form-input"
                value={pps}
                onChange={(e) => {
                  setPPS(e.target.value), setError(false), setAlert({});
                }}
              >
                <option value="" disabled>
                  Select Patient
                </option>
                {ppsList.map((patient) => (
                  <option key={patient.id} value={patient.pps}>
                    {`${patient.name} ${patient.surname}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="formbold-mb-5">
            <label className="formbold-form-label">Doctor</label>
            <select
              type="text"
              className="formbold-form-input"
              value={doctorName}
              onChange={(e) => {
                setDoctorName(e.target.value), setError(false), setAlert({});
              }}
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
          </div>

          <div className="flex flex-wrap formbold--mx-3">
            <div className="w-full sm:w-half formbold-px-3">
              <div className="formbold-mb-5 w-full">
                <label className="formbold-form-label"> Date </label>
                <input
                  type="date"
                  className="formbold-form-input"
                  value={appointmentDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="w-full sm:w-half formbold-px-3">
              <div className="formbold-mb-5">
                <label className="formbold-form-label">Time</label>
                <div className="custom-time-picker">
                  <select
                    className="formbold-form-input"
                    name="appointmentTime"
                    value={appointmentTime}
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
              </div>
            </div>
          </div>

          <div className="formbold-mb-5">
            <label className="formbold-form-label">Triage (Reason)</label>
            <select
              type="form-control"
              className="formbold-form-input"
              value={triage}
              onChange={(e) => {
                setTriage(e.target.value), setError(false), setAlert({});
              }}
            >
              <option value="" disabled>
                Select Triage
              </option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="formbold-mb-5">
            <label className="formbold-form-label">Description</label>
            <textarea
              type="text"
              className="formbold-form-input"
              placeholder="Enter a description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value), setError(false), setAlert({});
              }}
            />
          </div>
          <button className="formbold-btn" type="submit">
            Schedule Appointment
          </button>
        </form>
      </div>
      {<Alert alert={alert} />}
    </div>
  );
};

export default NewAppointment;
