import { Link } from "react-router-dom";
import { images } from "../constants";

const Navbar = ({ user }) => {
  const itemsNav = [];

  // User Role
  if (user && user.userRoles.some((role) => role.roleId === 3)) {
    itemsNav.splice(
      itemsNav.length,
      0,
      {
        logo: images.home,
        item: "Current Appointments",
        url: "/home",
      },
      {
        logo: images.appointment,
        item: "Schedule Appointments",
        url: "/home/newappointments",
      },
      {
        logo: images.Reschedule,
        item: "Edit Appointments",
        url: "/home/reschedule",
      },
      {
        logo: images.MedicalRecords,
        item: "Medical Records",
        url: "/home/records",
      }
    );
  }

  // Admin Role
  if (user && user.userRoles.some((role) => role.roleId === 1)) {
    itemsNav.splice(itemsNav.length, 0, {
      logo: images.config,
      item: "Settings",
      url: "/home/settings",
    });
  }

  // Doctor Role
  if (user && user.userRoles.some((role) => role.roleId === 2)) {
    itemsNav.splice(
      itemsNav.length,
      0,
      {
        logo: images.tasks,
        item: "Task Manager",
        url: "/home/tasks",
      },
      {
        logo: images.chat,
        item: "Chat",
        url: "/home/chat",
      }
    );
  }

  itemsNav.splice(itemsNav.length, 0, {
    logo: images.profile,
    item: "Account",
    url: "editUser",
  });

  return (
    <div className="contain__navbar">
      <nav className="navbar">
        <ul>
          {itemsNav.map((item) => (
            <Link key={item.item} to={item.url}>
              <li>
                <img src={item.logo} alt={`imagen ${item.logo}`} />
                <span>{item.item}</span>
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
