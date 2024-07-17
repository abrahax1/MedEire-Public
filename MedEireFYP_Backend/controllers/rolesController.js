import { PrismaClient } from "@prisma/client";
import {
  createIAMDoctorAndPolicy,
  deleteDoctorPolicy,
} from "../helpers/S3_Folders.js";
const prisma = new PrismaClient();

const getUsersAndRoles = async (req, res) => {
  try {
    const usersWithRoles = await prisma.user.findMany({
      select: {
        email: true,
        userRoles: {
          select: {
            roleId: true,
            role: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    });

    const Roles = await prisma.Roles.findMany({
      select: {
        description: true,
      },
    });

    res.json({ usersWithRoles, Roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not find users or roles" });
  }
};

const addRoles = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get the user's existing roles
    const userRoles = await prisma.userRoles.findMany({
      where: { userId: user.id },
    });

    // Get Roles
    const Roles = await prisma.roles.findMany({
      where: { description: role },
    });

    // Find the user's role with the matching role ID
    const userRole = userRoles.find((ur) => ur.roleId === Roles[0].id);

    if (userRole) {
      // User already has the specified role, do nothing
      return res.status(401).json({ msg: "User already has this role" });
    }

    // Add the role to the user
    await prisma.userRoles.create({
      data: {
        user: { connect: { id: user.id } },
        role: { connect: { id: Roles[0].id } },
      },
    });

    if (role === "Doctor") {
      const creates = await createIAMDoctorAndPolicy(email);
      if (!creates) {
        return res.status(401).json({ msg: "error creating policy" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }

  return res.status(200).json({ msg: "Role added to user" });
};

const deleteRoles = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get the user's existing roles
    const userRoles = await prisma.userRoles.findMany({
      where: { userId: user.id },
    });

    // Get Roles
    const Roles = await prisma.roles.findMany({
      where: { description: role },
    });

    // Find the user's role with the matching role ID
    const userRole = userRoles.find((ur) => ur.roleId === Roles[0].id);

    if (!userRole) {
      // User does not have the specified role, do nothing
      return res.status(401).json({ msg: "User does not have this role" });
    }

    // Remove the role from the user
    await prisma.userRoles.delete({
      where: { id: userRole.id },
    });

    if (role === "Doctor") {
      const deletes = await deleteDoctorPolicy(email);
      if (!deletes) {
        return res.status(401).json({ msg: "error deleting policy" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
  return res.status(200).json({ msg: "Role removed from user" });
};

export { getUsersAndRoles, addRoles, deleteRoles };
