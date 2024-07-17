import checkEmail from "./checkEmail";
import checkPassword from "./checkPassword";
import checkText from "./checkText";
import checkPPS from "./checkPPS";

const checkForm = (name, surname, email, pps, password, repeatPassword) => {
  // Check if any field is empty
  if (!name || !surname || !email || !pps || !password || !repeatPassword) {
    return {
      msg: "All information is necessary",
      error: true,
    };
  }

  // Check name and surname
  if (checkText(name, "name")) {
    checkText(name, "name");
    const { msg, error } = checkText(name, "name");
    return {
      msg: msg,
      error: error,
    };
  }

  if (checkText(surname, "surname")) {
    checkText(surname, "surname");
    const { msg, error } = checkText(surname, "surname");
    return {
      msg: msg,
      error: error,
    };
  }

  // check email
  if (checkEmail(email)) {
    checkEmail(email);
    const { msg, error } = checkEmail(email);
    return {
      msg: msg,
      error: error,
    };
  }

  // check PPS
  const PPSResult = checkPPS(pps);

  if (PPSResult.error) {
    return { msg: PPSResult.msg, error: PPSResult.error };
  }

  // check Password
  const passwordResult = checkPassword(password, repeatPassword);

  if (passwordResult.error) {
    return { msg: passwordResult.msg, error: passwordResult.error };
  }

  return { msg: "", error: false };
};

export default checkForm;
