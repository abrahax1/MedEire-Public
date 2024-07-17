const checkPassword = (password, repeatPassword) => {
  if (password.length < 8) {
    return {
      msg: "Password must be at least 8 characters",
      error: true,
    };
  } else if (password.length >= 30) {
    return {
      msg: "Password must be less than 30 characters",
      error: true,
    };
  } else if (!password.match(/\d/i)) {
    return {
      msg: "Must contain at least one number",
      error: true,
    };
  } else if (!password.match(/[A-Za-z]/)) {
    return {
      msg: "Must contain at least one letter",
      error: true,
    };
  } else if (!password.match(/[^a-z0-9\s'-]/i)) {
    return {
      msg: "Must contain at least one special character",
      error: true,
    };
  } else if (password.match(" ")) {
    return {
      msg: "Must not contain spaces",
      error: true,
    };
  } else if (password !== repeatPassword) {
    return {
      msg: "Passwords must match",
      error: true,
    };
  } else {
    return {
      msg: "",
      error: false,
    };
  }
};

export default checkPassword;
