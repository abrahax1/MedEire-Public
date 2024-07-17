const AppointmentScheduler = (e) => {
    return (
        <div>
          <div>{e.text}</div>
          <div>Doctor: {e.appointmentData.doctorName}</div>
          {e.appointmentData.patientPPS ? (
            <div>Patient's PPS: {e.appointmentData.patientPPS}</div>
          ) : null}
          <div>{`Start Date: ${e.appointmentData.startDate.toLocaleDateString()} ${e.appointmentData.startDate.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}`}</div>
          <div>Triage: {e.appointmentData.triage}</div>
          <div>Description: {e.appointmentData.description}</div>
        </div>
      );
};

export default AppointmentScheduler;
