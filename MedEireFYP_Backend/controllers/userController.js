import { registrationEmail, retrieveEmail } from "../helpers/email.js";
import {
  S3_CreateFolders,
  S3_RenameFolder,
  S3_DeleteFoldersAndFiles,
  S3_CreateIAMUserAndPolicy,
  deleteIAMUserAndPolicy,
} from "../helpers/S3_Folders.js";
import { createID } from "../helpers/generateID.js";
import createJWT from "../helpers/createJWT.js";
import {
  checkEmailVerificationStatus,
  deleteEmailSES,
} from "../helpers/SES_EmailVerification.js";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const register = async (req, res) => {
  // check if user exists
  const { email, password, name, surname, pps } = req.body;

  const userExists = await prisma.User.findFirst({
    where: { email: email },
  });
  if (userExists) {
    const error = new Error("Email already registered");
    return res.status(400).json({
      msg: error.message,
    });
  }

  const ppsExists = await prisma.User.findFirst({
    where: { pps: pps },
  });
  if (ppsExists) {
    const error = new Error("PPS already registered");
    return res.status(400).json({
      msg: error.message,
    });
  }

  // create user
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // hash the password
    prisma.token = createID();
    const userCreated = await prisma.User.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        surname: surname,
        pps: pps,
        token: prisma.token,
        confirm: true,
        userRoles: {
          create: {
            roleId: 3,
          },
        },
      },
    });
    registrationEmail({ email: email });
    res.json(userCreated);
  } catch (error) {
    console.log(error);
  }
};

const confirm = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new Error("No token provided for confirmation");
  }

  const { id } = await prisma.User.findFirst({ where: { token } });

  if (!id) {
    return res.status(403).json({ msg: "Invalid token for confirmation" });
  }

  try {
    const user = await prisma.User.update({
      where: { id },
      data: { token: "", confirm: false },
    });

    await S3_CreateFolders({ email: user.email });
    await S3_CreateIAMUserAndPolicy({ email: user.email });
    return;
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error on confirmation" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.User.findFirst({
      where: { email: email },
      include: {
        userRoles: {
          select: {
            roleId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "Incorrect email or password",
        error: "Incorrect email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // compare the hashed password
    if (!isPasswordValid) {
      return res.status(404).json({
        msg: "Incorrect email or password",
        error: "Incorrect email or password",
      });
    }

    if (user.confirm) {
      const sesCheck = await checkEmailVerificationStatus(email);
      if (sesCheck) {
        const checkConfirm = await confirm(
          { params: { token: user.token } },
          res
        );

        if (checkConfirm) {
          return res.status(403).json({
            msg: "Error confirming account",
            error: true,
          });
        }
      } else {
        return res.status(403).json({
          msg: "account not verified",
          error: "Account not verified yet",
        });
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      pps: user.pps,
      userRoles: user.userRoles,
      token: createJWT(user.id),
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({
      msg: error.message,
    });
  }
};

const forgot = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.User.findFirst({
    where: { email: email },
  });

  if (!user) {
    const error = new Error("User not found");
    return res.status(404).json({
      msg: error.message,
      error: true,
    });
  } else {
    try {
      const user = new PrismaClient({});
      user.token = createID();

      const userFound = await prisma.User.update({
        where: { email: email },
        data: { token: user.token, confirm: true },
      });
      if (userFound) {
        const userData = {
          email: userFound.email,
          name: userFound.name,
          surname: userFound.surname,
          token: userFound.token,
        };

        retrieveEmail(userData);
        res.json({
          msg: "Email sent to your account",
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        msg: "Error on email",
        error: true,
      });
    }
  }
};

const retrieve = async (req, res) => {
  const { token } = req.params;

  const validToken = await prisma.User.findFirst({
    where: { token: token },
  });

  if (validToken) {
    res.json({
      valid: true,
      msg: "Valid token",
    });
  } else {
    const error = new Error("Invalid token on retrieve account");
    return res.status(404).json({
      valid: false,
      msg: error.message,
    });
  }
};

const newPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findFirst({
    where: { token: token },
  });

  if (user) {
    try {
      const updatedPassword = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, token: "", confirm: false },
      });
      if (updatedPassword) {
        res.json({
          msg: "Password changed",
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        msg: "Error, password not changed",
        error: true,
      });
    }
  } else {
    const error = new Error("wrong token on password change");
    return res.status(404).json({
      error: true,
      msg: error.message,
    });
  }
};

const profile = async (req, res) => {
  const { user } = req;
  res.json(user);
};

const updateUser = async (req, res) => {
  let { id, name, surname, email, password, confirmPassword, pps } = req.body;
  let hashedPassword = "";

  const user = await prisma.User.findFirst({
    where: { id: id },
  });

  if (password === "") {
    hashedPassword = user.password;
  } else {
    if (password === confirmPassword) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      return res.status(401).json({
        msg: "Passwords do not match",
        error: true,
      });
    }
  }

  if (user.email != email) {
    try {
      const userExists = await prisma.User.findFirst({
        where: { email: email },
      });
      if (userExists) {
        const error = new Error("Email already registered");
        return res.status(400).json({
          msg: error.message,
          error: true
        });
      }

      // delete SES email
      await deleteEmailSES(user.email);

      // rename and delete folders, user and policies on old email
      await S3_RenameFolder(email, user.email);
      await S3_DeleteFoldersAndFiles(user.email);
      await deleteIAMUserAndPolicy(user.email);

      // New verification + folders and policies creation for new email
      const jwt = createJWT(id);
      await registrationEmail({ email: email });
      await S3_CreateIAMUserAndPolicy({ email: email });

      await prisma.user.update({
        where: { id: id },
        data: {
          name,
          surname,
          email,
          password: hashedPassword,
          pps,
          confirm: false,
          token: jwt,
        },
      });

      res.status(200).json({ msg: "User data updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Internal error updating data (policies or folders)",
        error: true,
      });
    }
  } else {
    try {
      await prisma.user.update({
        where: { id: id },
        data: { name, surname, password: hashedPassword, pps },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Failed to update user" });
    }

    res.status(200).json({ msg: "User data updated" });
  }
};

const deleteUser = async (req, res) => {
  const { id, email } = req.user;

  // delete SES email
  try {
    deleteEmailSES(email);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete SES email" });
  }

  // delete S3 files, folder, IAM policy, user
  try {
    await S3_DeleteFoldersAndFiles(email);
    await deleteIAMUserAndPolicy(email);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete folders or IAMs" });
  }

  // delete roles, appointments and user data
  try {
    await prisma.userRoles.deleteMany({ where: { userId: id } });
    await prisma.appointments.deleteMany({ where: { userID: id } });
    await prisma.user.delete({ where: { id: id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }

  res.status(200).json({ message: "Account deleted" });
};

export {
  register,
  login,
  confirm,
  forgot,
  retrieve,
  newPassword,
  profile,
  updateUser,
  deleteUser,
};
