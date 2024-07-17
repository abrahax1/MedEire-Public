import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.decodedToken = decoded;
      req.user = await prisma.User.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          pps: true,
          userRoles: {
            select: {
              roleId: true,
            },
          },
        },
      });
    } catch (error) {
      return res.status(404).json({
        msg: "error, Invalid token",
      });
    }
  }

  if (!token) {
    const error = new Error("invalid token");
    return res.status(401).json({
      msg: error.message,
    });
  }

  // If the function gets here, it means that the token was valid and the user was authorized
  next();
};

export default checkAuth;
