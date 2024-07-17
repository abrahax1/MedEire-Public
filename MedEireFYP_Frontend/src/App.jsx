import "devextreme/dist/css/dx.material.teal.light.compact.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import AuthLayout from "./layout/AuthLayout";
import Login from "./pagesAuth/Login";
import Register from "./pagesAuth/Register";
import ForgetPassword from "./pagesAuth/ForgetPassword";
import NewPassword from "./pagesAuth/NewPassword";
import ConfirmAccount from "./pagesAuth/ConfirmAccount";
import AreaPrivate from "./layout/AreaPrivate";
import Home from "./pages/Home";
import NewAppointment from "./pages/NewAppointments";
import EditAppointment from "./pages/EditAppointments";
import MedicalRecords from "./pages/MedicalRecords";
import Settings from "./pages/Settings";
import TaskManager from "./pages/TaskManager";
import EditUser from "./pages/EditUser";
import "./App.scss";
import LiveChat from "./pages/LiveChat";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgetPassword />} />
            <Route path="new-password/:token" element={<NewPassword />} />
            <Route path="confirm/:id" element={<ConfirmAccount />} />
          </Route>

          <Route path="/home" element={<AreaPrivate />}>
            <Route index element={<Home />} />
            <Route path="newappointments" element={<NewAppointment />} />
            <Route path="reschedule" element={<EditAppointment />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="editUser" element={<EditUser />} />
            <Route path="chat" element={<LiveChat />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
