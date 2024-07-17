import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

process.on("unhandledRejection", (err) => {
  console.log(err);
});

AWS.config.update({
  accessKeyId: process.env.SES_USER,
  secretAccessKey: process.env.SES_KEY,
  region: process.env.REGION,
  version: "2010-12-01",
});

const ses = new AWS.SES({
  signatureVersion: "v4",
});

async function SES_EmailVerification({ email }) {
  email = email.toString();

  try {
    const result = await ses
      .verifyEmailIdentity({ EmailAddress: email })
      .promise();

    if (!result) {
      console.error(
        `Error sending verification request for ${email}: verification result is undefined.`
      );
    }
  } catch (error) {
    if (
      error.code === "MessageRejected" &&
      error.message.includes("Email address is not verified")
    ) {
      console.error(
        `Error sending email to ${email}: email address must be verified.`
      );
    } else {
      console.error(
        `Error sending verification request for ${email}: ${error}`
      );
    }
  }
}

const checkEmailVerificationStatus = async (email) => {
  email = email.toLowerCase();
  const response = await ses
    .getIdentityVerificationAttributes({
      Identities: [email],
    })
    .promise();

  const verificationAttributes = response.VerificationAttributes;
  return verificationAttributes[email].VerificationStatus === "Success";
};

const deleteEmailSES = async (email) => {
  try {
    const result = await ses.deleteIdentity({ Identity: email }).promise();
  } catch (error) {
    console.error(`Error deleting email identity ${email}: ${error}`);
  }
};

export { SES_EmailVerification, checkEmailVerificationStatus, deleteEmailSES };
