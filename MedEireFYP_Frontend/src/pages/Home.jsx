import React, { useState, useEffect } from "react";
import Scheduler from "devextreme-react/scheduler";
import AppointmentScheduler from "../components/Scheduler"

const AppointmentURL = import.meta.env.VITE_Appointment_URL;

const Home = () => {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const getAppointments = async () => {
      try {
        const resp = await fetch(AppointmentURL, { headers });
        if (!resp.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await resp.json();
        setAppointments(data.appointments);
      } catch (error) {
        console.error(error);
      }
    };

    getAppointments();
  }, []);

  const appointmentTooltipRender = (e) => {
    return <AppointmentScheduler appointmentData={e.appointmentData} />;
  };

  return (
    <div className="container_scheduler-function">
      <h1>Current Appointments</h1>
      <Scheduler
        elementAttr={{ class: "test_scheduler" }}
        dataSource={appointments.map((appointment) => {
          const startDate = new Date(appointment.appointmentDate);
          const endDate = new Date(startDate.getTime() + 30 * 60000); // add 30 minutes (30 * 60 * 1000 milliseconds)
          const extraData = {};
          if (appointment.user && appointment.user.pps) {
            extraData.patientPPS = appointment.user.pps;
          }
          return {
            text: appointment.triage,
            startDate: startDate,
            endDate: endDate,
            description: appointment.description,
            doctorName: appointment.doctorName,
            triage: appointment.triage,
            ...(appointment.user && appointment.user.pps
              ? { patientPPS: appointment.user.pps }
              : {}),
          };
        })}
        views={["day", "week", "month"]}
        onAppointmentDblClick={(e) => {
          e.cancel = true;
        }}
        onCellClick={(e) => {
          e.cancel = true;
        }}
        editing={false} // disable editing
        defaultCurrentView="month"
        startDayHour={8}
        endDayHour={19}
        appointmentTooltipRender={appointmentTooltipRender}
          
      />
    </div>
  );
};

export default Home;
