const checkEmail = (email) => {
  email = email.trim()
  const emailRegex =
    /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;

  if (!emailRegex.test(email)) {
    return {
      msg: "incorrect email.",
      error: true,
    };
  }
};

export default checkEmail;
