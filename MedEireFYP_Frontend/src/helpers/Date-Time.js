const handleDate = (selectedDate) => {
  const now = new Date();
  const [year, month, day] = selectedDate.split("-");
  const selectedDateTime = new Date(year, month - 1, day);

  if (selectedDateTime < now.setHours(0, 0, 0, 0)) {
    return {
      msg: "Selected date is in the past",
      error: true,
      selectedDate: "",
    };
  } else {
    return {
      msg: "",
      error: false,
      selectedDate,
    };
  }
};

const handleTime = (selectedTime, appointmentDate) => {
  if (!appointmentDate) {
    return {
      msg: "Please select a date first",
      error: true,
      time: undefined,
    };
  }

  const [formatHours, formatMinutes] = selectedTime.split(":");

  const now = new Date();
  const [year, month, day] = appointmentDate.split("-");
  const selectedDateTime = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    formatHours,
    formatMinutes
  );

  if (selectedDateTime < now) {
    return {
      msg: "Selected time is in the past",
      error: true,
      time: undefined,
    };
  } else {
    const hours = selectedDateTime.getHours();
    const minutes = selectedDateTime.getMinutes();
    const time = `${hours}:${minutes}`;

    return {
      msg: "",
      error: false,
      time: time,
    };
  }
};

const checkAvailability = async (
  doctorName,
  appointmentDate,
  appointmentTime,
  ID,
  AppointmentURL,
  headers,
  isExistingAppointment
) => {
  let APIURL = "";

  if (!ID || !appointmentDate || !appointmentTime || !doctorName) {
    return false, { msg: "" };
  }

  // New appointment url
  if (isExistingAppointment === false) {
    APIURL = `${AppointmentURL}check/${ID}?appointmentDate=${encodeURIComponent(
      appointmentDate
    )}&appointmentTime=${encodeURIComponent(
      appointmentTime
    )}&doctorName=${encodeURIComponent(doctorName)}`;
  }

  // Edit appointment url
  else {
    APIURL = `${AppointmentURL}check/${ID}?appointmentDate=${encodeURIComponent(
      appointmentDate
    )}&appointmentTime=${encodeURIComponent(
      appointmentTime
    )}&doctorName=${encodeURIComponent(
      doctorName
    )}&isExistingAppointment=${isExistingAppointment}`;
  }

  try {
    const response = await fetch(APIURL, { method: "GET", headers: headers });
    const data = await response.json();

    if (response.status === 409) {
      return false, { msg: data.msg };
    } else {
      return true, { msg: data.msg };
    }
  } catch (error) {
    console.error(error);
    return false, { msg: "server error" };
  }
};

export { handleDate, handleTime, checkAvailability };
