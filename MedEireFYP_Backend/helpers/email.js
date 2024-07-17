import nodemailer from "nodemailer";
import { SES_EmailVerification } from "./SES_EmailVerification.js";

process.on("unhandledRejection", (err) => {
  console.log(err);
});

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registrationEmail = async (data) => {
  const { email } = data;
  await SES_EmailVerification({ email });
};

export const retrieveEmail = async (data) => {
  const { email, name, surname, token } = data;

  // Email template
  const info = await transport.sendMail({
    from: `'"MedEire" <${process.env.SENDER}>'`, // sender address
    to: email, // list of receivers
    subject: "MedEire - recover your account ✔", // Subject line
    text: "retrieve your MedEire account", // plain text body
    html: ` <p> Hi: ${name} ${surname} retrieve your account</p>
      <p>There is only one step left to retrieve your account, click the following link:
      <a href='${process.env.FRONTEND_URL}/new-password/${token}'>Retrieve password</a>
      </p>
      
      <p>if you have not requested this email, please ignore this email</p>

      `, // html body
  });
};

export const newAppointmentEmail = async (data) => {
  const {
    name,
    surname,
    appointmentDate,
    appointmentTime,
    email,
    triage,
    doctorName,
    description,
  } = data;

  // Email template
  const info = await transport.sendMail({
    from: `'"MedEire" <${process.env.SENDER}>'`, // sender address
    to: email, // list of receivers
    subject: "MedEire - Your appointment has been confirmed ✔", // Subject line
    text: "Confirmed appointment", // plain text body
    html: ` <p> Hi: ${name} ${surname} your appointment has been confirmed</p>
    <p>Here are the details for your appointment:</p>
    <p>- Date: ${appointmentDate}</p>
    <p>- Time: ${appointmentTime}</p>
    <p>- Triage: ${triage}</p>
    <p>- Doctor: ${doctorName}</p>
    <p>- Description: ${description}<p>
    <p>If you wish to update or cancel this appointment login into your account</p>
    `, // html body
  });
};
