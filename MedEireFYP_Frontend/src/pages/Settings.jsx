import { useState, useEffect } from "react";
import Alert from "../components/Alert";

const RolesURL = import.meta.env.VITE_Roles_URL;

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [alert, setAlert] = useState({});
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch users and roles on mount
  useEffect(() => {
    const getUser_Roles = async () => {
      try {
        const resp = await fetch(`${RolesURL}user_roles`, {
          method: "GET",
          headers,
        });
        if (!resp.ok) {
          console.log("error");
          throw new Error("Network response was not ok");
        }

        const data = await resp.json();
        setUsers(data.usersWithRoles);
        setRoles(data.Roles);
      } catch (error) {
        console.log(error);
      }
    };
    getUser_Roles();
  }, []);

  // Update selected user roles when user roles change
  useEffect(() => {
    if (selectedUser) {
      const user = users.find((user) => user.email === selectedUser);
      setSelectedUserRoles(user?.userRoles || []);
    }
  }, [users, selectedUser]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser || !selectedRole) {
      setAlert({ msg: "select user and role to add", error: true });
      return;
    }

    const raw = JSON.stringify({
      email: selectedUser,
      role: selectedRole,
    });

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
    };

    try {
      const resp = await fetch(`${RolesURL}add_roles`, requestOptions);
      const result = await resp.json();

      if (resp.status === 200) {
        setAlert({
          msg: result.msg,
          error: false,
        });
        setSelectedUser("");
        setSelectedRole("");

        // Update the users state with the new role
        const updatedUsers = users.map((user) => {
          if (user.email === selectedUser) {
            console.log("selectedRole", selectedRole);
            return {
              ...user,
              userRoles: [
                ...user.userRoles,
                { roleId: selectedRole, role: { description: selectedRole } },
              ],
            };
          }

          return user;
        });
        setUsers(updatedUsers);
      } else {
        setAlert({
          msg: result.msg,
          error: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteRole = async (event) => {
    event.preventDefault();

    if (!selectedUser || !selectedRole) {
      setAlert({ msg: "select user and role to remove", error: true });
      return;
    }

    const raw = JSON.stringify({
      email: selectedUser,
      role: selectedRole,
    });

    let requestOptions = {
      method: "DELETE",
      headers: headers,
      body: raw,
    };

    try {
      const resp = await fetch(`${RolesURL}delete_roles`, requestOptions);
      const result = await resp.json();

      if (resp.status === 200) {
        setAlert({
          msg: result.msg,
          error: false,
        });
        setSelectedUser("");
        setSelectedRole("");

        // Update the users state by removing the deleted role
        const updatedUsers = users.map((user) => {
          if (user.email === selectedUser) {
            return {
              ...user,
              userRoles: user.userRoles.filter(
                (role) => role.role.description !== selectedRole
              ),
            };
          }
          return user;
        });
        setUsers(updatedUsers);
      } else {
        setAlert({
          msg: result.msg,
          error: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="Settings">
        <h1>Settings</h1>
        <form onSubmit={handleSubmit}>
          <label>
            User:
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select user</option>
              {users &&
                users.map((user, index) => (
                  <option key={index} value={user.email}>
                    {user.email}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Role:
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select role</option>
              {roles &&
                roles.map((role, index) => (
                  <option key={index} value={role.description}>
                    {role.description}
                  </option>
                ))}
            </select>
          </label>
          <br />
          <br />

          {selectedUser && (
            <>
              <p>Current roles:</p>
              {selectedUserRoles.map((role, index) => (
                <li key={index}>{role.role.description}</li>
              ))}
            </>
          )}

          <br />
          <br />
          <button type="submit">Add role</button>
          <button onClick={handleDeleteRole}>delete role</button>
        </form>

        {<Alert alert={alert} />}
      </div>
    </>
  );
};

export default Settings;
