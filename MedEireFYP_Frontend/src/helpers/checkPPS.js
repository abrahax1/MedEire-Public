const checkPPS = (pps) => {
  const ppsRegex = /^\d{7}[a-zA-Z]{1,2}$/;
  if (!ppsRegex.test(pps)) {
    return {
      msg: "Invalid PPS number",
      error: true,
    };
  } else {
    return {
      msg: "",
      error: false,
    };
  }
};

export default checkPPS;
