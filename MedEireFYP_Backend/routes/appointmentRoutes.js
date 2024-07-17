import express from "express";
const router = express.Router();

import {
  createAppointment,
  editAppointment,
  getAppointments,
  checkAppointments,
  allAppointments,
  deleteAppointment,
  getDoctors,
  getPatients,
} from "../controllers/appointmentController.js";
import checkAuth from "../middleware/checkAuth.js";

router.post("/", checkAuth, createAppointment); // creates appointment
router.get("/", checkAuth, getAppointments); // view appointments
router.get("/check/:id", checkAuth, checkAppointments); // checkAvailability of appointments
router.get("/allAppointments", checkAuth, allAppointments); // check all appointments for removing unavailable times
router.route("/:id")
  .put(checkAuth, editAppointment) // edit appointments
  .delete(checkAuth, deleteAppointment); // Delete appointment

// TEST
// router
//   .route("/:id")
//   .get(checkAuth, getAddress)
//   .put(checkAuth, updateAddress)
//   .delete(checkAuth, deleteAddress);


router.get("/doctors", checkAuth, getDoctors); // get doctors from database
router.get("/patients", checkAuth, getPatients); // get patients from database

export default router;
