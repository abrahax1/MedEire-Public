import Jwt from "jsonwebtoken";

const createJWT = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default createJWT;
