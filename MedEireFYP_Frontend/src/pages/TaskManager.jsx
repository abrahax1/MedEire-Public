import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const TasksURL = import.meta.env.VITE_Tasks_URL;

const TaskManager = () => {
  //TODO: create database, fetch tasks

  // Define initial tasks state
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task 1",
      description: "Description 1",
      status: "todo",
      assignee: "User 1",
    },
    {
      id: 2,
      title: "Task 2",
      description: "Description 2",
      status: "in progress",
      assignee: "User 2",
    },
    {
      id: 3,
      title: "Task 3",
      description: "Description 3",
      status: "completed",
      assignee: "User 1",
    },
  ]);

  // Define form state
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    assignee: "",
  });

  // Handle form input changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submit
  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Generate unique id for new task
    const newId = tasks.length + 1;
    // Create new task object
    const newTask = {
      id: newId,
      title: formState.title,
      description: formState.description,
      status: "todo",
      assignee: formState.assignee,
    };
    // Add new task to tasks state
    setTasks((prevState) => [...prevState, newTask]);
    // Clear form
    setFormState({
      title: "",
      description: "",
      assignee: "",
    });
  };

  // Handle task status change
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevState) =>
      prevState.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        } else {
          return task;
        }
      })
    );
  };

  // Handle task delete
  const handleTaskDelete = (taskId) => {
    setTasks((prevState) => prevState.filter((task) => task.id !== taskId));
  };

  // Define functions for showing and hiding the task form
  const [showForm, setShowForm] = useState(false);
  const handleAddTask = () => setShowForm(true);
  const handleCancel = () => setShowForm(false);

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formState.title}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleFormChange}
          ></textarea>
        </div>
        <div>
          <label htmlFor="assignee">Assignee:</label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            value={formState.assignee}
            onChange={handleFormChange}
          />
        </div>
        <button type="submit">Add Task</button>
      </form>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Assignee: {task.assignee}</p>
            <p>Status: {task.status}</p>
            <button onClick={() => handleStatusChange(task.id, "todo")}>
              Todo
            </button>
            <button onClick={() => handleStatusChange(task.id, "in progress")}>
              In Progress
            </button>
            <button onClick={() => handleStatusChange(task.id, "completed")}>
              Completed
            </button>
            <button onClick={() => handleTaskDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
