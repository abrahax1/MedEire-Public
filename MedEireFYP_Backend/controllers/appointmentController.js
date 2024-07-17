import { newAppointmentEmail } from "../helpers/email.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  const {
    pps,
    appointmentDate,
    appointmentTime,
    triage,
    doctorName,
    description,
  } = req.body;

  const [year, month, day] = appointmentDate.split("-");
  const [hours, minutes] = appointmentTime.split(":");
  const dateTime = new Date(year, month - 1, day, hours, minutes);

  if (
    !pps ||
    !appointmentDate ||
    !appointmentTime ||
    !triage ||
    !doctorName ||
    !description
  ) {
    return res.status(400).json({ error: "all information is required" });
  }

  try {
    const userExists = await prisma.User.findFirst({
      where: { pps: pps },
    });
    if (!userExists) {
      const error = new Error("PPS not found");
      return res.status(400).json({
        error: error.message,
      });
    }
    const U_ID = userExists.id;
    const U_name = userExists.name;
    const U_surname = userExists.surname;
    const U_email = userExists.email;

    const appointmentCreated = await prisma.Appointments.create({
      data: {
        userID: U_ID,
        appointmentDate: dateTime,
        triage: triage,
        doctorName: doctorName,
        description: description,
      },
    });

    newAppointmentEmail({
      name: U_name,
      surname: U_surname,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      email: U_email,
      triage: triage,
      doctorName: doctorName,
      description: description,
    });
    res.json(appointmentCreated);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const getAppointments = async (req, res) => {
  const { id, userRoles, name, surname } = req.user;
  const doctorName = name + " " + surname;

  if (userRoles && userRoles.some((userRoles) => userRoles.roleId === 2)) {
    try {
      const appointments = await prisma.Appointments.findMany({
        where: { doctorName: doctorName },
        orderBy: { appointmentDate: "asc" },
        select: {
          id: true,
          appointmentDate: true,
          triage: true,
          doctorName: true,
          user: {
            select: {
              pps: true,
            },
          },
          description: true,
        },
      });

      if (!appointments) {
        const error = new Error("No appointments found");
        return res.status(404).json({
          msg: error.message,
        });
      }

      return res.status(200).json({ appointments, userRoles });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } else {
    try {
      const appointments = await prisma.Appointments.findMany({
        where: { userID: id },
        orderBy: { appointmentDate: "asc" },
        select: {
          id: true,
          appointmentDate: true,
          triage: true,
          doctorName: true,
          description: true,
        },
      });

      if (!appointments) {
        const error = new Error("No appointments found");
        return res.status(404).json({
          msg: error.message,
        });
      }

      return res.status(200).json({ appointments, userRoles });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ msg: "Unauthorized" });
    }
  }
};

const checkAppointments = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { appointmentDate, appointmentTime, doctorName } = req.query;
  let ID = "";
  const isExistingAppointment = req.query.isExistingAppointment === "true";

  if (/\d/.test(req.params.id) && /[a-zA-Z]/.test(req.params.id)) {
    ID = req.params.id;
  } else {
    ID = parseInt(req.params.id);
  }

  const [year, month, day] = appointmentDate.split("-");
  const [hours, minutes] = appointmentTime.split(":");
  const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();

  if (selectedDateTime < now) {
    return res.status(403).json({
      msg: "Selected time is in the past",
      error: true,
    });
  }

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    // Check if the requested appointment conflicts with any existing appointments
    const doctorAndDateUnavailable = await prisma.appointments.findMany({
      where: { doctorName: doctorName, appointmentDate: selectedDateTime },
    });

    if (
      doctorAndDateUnavailable.length > 0 &&
      doctorAndDateUnavailable[0].id === ID
    ) {
      // The conflicting appointment is the one being edited, so allow the edit
      return res.status(200).json({
        error: false,
        msg: "",
      });
    }

    if (doctorAndDateUnavailable.length > 0) {
      return res.status(409).json({
        error: true,
        msg: "Doctor is unavailable at this time. Please choose another doctor or time",
      });
    }

    // New appointment
    if (isExistingAppointment === false) {
      const pps = String(ID);

      // Find userID with pps
      const ppsExists = await prisma.User.findUnique({
        where: { pps: pps },
      });

      if (!ppsExists) {
        return res.status(400).json({
          error: true,
          msg: `Patient's PPS not found`,
        });
      }

      const userID = ppsExists.id;

      const userUnavailable = await prisma.appointments.findMany({
        where: { userID: userID, appointmentDate: selectedDateTime },
      });

      if (userUnavailable.length > 0) {
        return res.status(409).json({
          error: true,
          msg: `You already have an appointment at this time. Please choose another time`,
        });
      }
    }

    // Edit appointment
    else {
      // Find userID with appointment ID
      const appointmentData = await prisma.appointments.findUnique({
        where: { id: ID },
      });

      const userID = appointmentData.userID;

      // Find appointment with the same userID and date, time
      const userUnavailable = await prisma.appointments.findMany({
        where: { userID: userID, appointmentDate: selectedDateTime },
      });

      if (userUnavailable.length > 0) {
        return res.status(409).json({
          error: true,
          msg: `You already have an appointment at this time. Please choose another time`,
        });
      }
    }

    return res.status(200).json({
      error: false,
      msg: "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, msg: "Internal Server Error" });
  }
};

const allAppointments = async (req, res) => {
  const { doctorName, appointmentDate } = req.query;

  // check all appointments
  try {
    const allAppointments = await prisma.Appointments.findMany({
      where: { doctorName: doctorName },
    });

    // Convert the appointmentDate string to a Date object and extract the year, month, and day
    const filterDate = new Date(appointmentDate);
    const filterYear = filterDate.getFullYear();
    const filterMonth = filterDate.getMonth();
    const filterDay = filterDate.getDate();

    // Filter appointments by the specific date
    const filteredAppointments = allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return (
        appointmentDate.getFullYear() === filterYear &&
        appointmentDate.getMonth() === filterMonth &&
        appointmentDate.getDate() === filterDay
      );
    });

    const appointmentTimes = filteredAppointments.map((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return `${appointmentDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${appointmentDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    });

    // Send appointment times to the client
    res.status(200).json({ appointmentTimes });
  } catch (error) {
    console.error("Error:", error);
  }
};

const editAppointment = async (req, res) => {
  const { appointmentDate, appointmentTime, triage, doctorName, description } =
    req.body;
  const appointmentID = parseInt(req.params.id);

  const [year, month, day] = appointmentDate.split("-");
  const [hours, minutes] = appointmentTime.split(":");
  const dateTime = new Date(year, month - 1, day, hours, minutes);

  if (
    !appointmentDate ||
    !appointmentTime ||
    !triage ||
    !doctorName ||
    !description
  ) {
    return res
      .status(400)
      .json({ msg: "all information is required", error: true });
  }

  try {
    const updateAppointment = await prisma.Appointments.update({
      where: { id: appointmentID },
      data: {
        appointmentDate: dateTime,
        triage: triage,
        doctorName: doctorName,
        description: description,
      },
    });

    if (!updateAppointment) {
      return res.status(403).json({
        error: error.message,
      });
    }

    const user = await prisma.User.findFirst({
      where: { id: updateAppointment.userID },
    });
    if (!user) {
      const error = new Error("user not found");
      return res.status(403).json({
        error: error.message,
      });
    }
    const U_name = user.name;
    const U_surname = user.surname;
    const U_email = user.email;

    res.json(updateAppointment);
    newAppointmentEmail({
      name: U_name,
      surname: U_surname,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      email: U_email,
      triage: triage,
      doctorName: doctorName,
      description: description,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const deleteAppointment = async (req, res) => {
  const appointmentID = parseInt(req.params.id);

  try {
    const deleteAppointment = await prisma.appointments.delete({
      where: { id: parseInt(appointmentID) },
    });
    res.json(deleteAppointment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.User.findMany({
      where: {
        userRoles: {
          some: {
            roleId: 2,
          },
        },
      },
      select: {
        name: true,
        surname: true,
        id: true,
      },
    });

    return res.status(200).json({
      msg: "Doctors found",
      doctors: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server error",
      error: true,
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await prisma.User.findMany({
      where: {
        userRoles: {
          some: {
            roleId: 3,
          },
        },
      },
      select: {
        name: true,
        surname: true,
        id: true,
        pps: true,
      },
    });

    return res.status(200).json({
      msg: "patients found",
      patients: patients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server error",
      error: true,
    });
  }
};

export {
  createAppointment,
  getAppointments,
  checkAppointments,
  allAppointments,
  editAppointment,
  deleteAppointment,
  getDoctors,
  getPatients,
};
