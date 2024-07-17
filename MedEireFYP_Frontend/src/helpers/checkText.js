const checkText = (text, holder) => {
  if (text.length < 2) {
    return {
      msg: `${holder} is too short`,
      error: true,
    };
  } else if (text.length >= 20) {
    return {
      msg: `${holder} is too long`,
      error: true,
    };
  } else if (text.match(/[0-9]/i)) {
    return {
      msg: `${holder} must not contain numbers`,
      error: true,
    };
  } else if (text.match(/[^A-Za-z0-9-' ']/i)) {
    return {
      msg: `${holder} must not contain numbers`,
      error: true,
    };
  }
};

export default checkText;
