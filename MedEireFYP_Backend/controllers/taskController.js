import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllTasks = async () => {
  const tasks = await prisma.task.findMany();
  return tasks;
};

const createTask = async ({ title, description, assignee }) => {
  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignee,
      status: "todo",
    },
  });
  return task;
};

const updateTaskStatus = async ({ taskId, status }) => {
  const task = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status,
    },
  });
  return task;
};

const deleteTask = async ({ taskId }) => {
  const task = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
  return task;
};

export { getAllTasks };
