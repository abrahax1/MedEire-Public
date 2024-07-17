import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Alert from "../components/Alert";
import checkForm from "../helpers/checkForm";
const UserURL = import.meta.env.VITE_USER_URL;

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [pps, setPPS] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formResult = checkForm(
      name,
      surname,
      email,
      pps,
      password,
      repeatPassword
    );

    setError(formResult.error);
    setAlert({ msg: formResult.msg, error: formResult.error });

    if (!formResult.error) {
      setError(false);
      setAlert({});
      requestRegister();
    }
  };

  const requestRegister = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      name: name,
      surname: surname,
      email: email,
      pps: pps,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const resp = await fetch(`${UserURL}`, requestOptions);
      const result = await resp.json();
      if (!result.msg) {
        setAlert({
          msg: "User created, check your email to confirm",
          error: false,
        });
        setName("");
        setSurname("");
        setEmail("");
        setPPS("");
        setPassword("");
        setRepeatPassword("");
        setTimeout(() => {
          navigate("/");
        }, 5000);
        return;
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
    <div className="container">
      <h1>Register here!</h1>
      <form className="form-contain" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          value={name}
          className={`name ${error && name === "" && "error"}`}
          placeholder={`${error ? "Must include name" : "name"}`}
          onChange={(e) => {
            setName(e.target.value), setError(false), setAlert({});
          }}
        />
        <br />

        <input
          type="text"
          value={surname}
          className={`surname ${error && surname === "" && "error"}`}
          placeholder={`${error ? "Must include surname" : "surname"}`}
          onChange={(e) => {
            setSurname(e.target.value), setError(false), setAlert({});
          }}
        />
        <br />

        <input
          type="email"
          value={email}
          className={`email ${error && email === "" && "error"}`}
          placeholder={`${error ? "Must include email" : "Email"}`}
          onChange={(e) => {
            setEmail(e.target.value), setError(false);
          }}
        />
        <br />

        <input
          type="text"
          value={pps}
          className={`pps ${error && pps === "" && "error"}`}
          placeholder={`${error ? "Must include pps" : "PPS"}`}
          onChange={(e) => {
            setPPS(e.target.value), setError(false);
          }}
        />
        <br />

        <input
          type="password"
          value={password}
          className={`pwd ${error && password === "" && "error"}`}
          placeholder={`${error ? "Must include password" : "Password"}`}
          onChange={(e) => {
            setPassword(e.target.value), setError(false);
          }}
        />
        <br />

        <input
          type="password"
          value={repeatPassword}
          className={`pwd ${error && repeatPassword === "" && "error"}`}
          placeholder={`${error ? "Must include password" : "Repeat Password"}`}
          onChange={(e) => {
            setRepeatPassword(e.target.value), setError(false);
          }}
        />
        <br />

        {<Alert alert={alert} />}

        <input type="submit" value="Create account" />
      </form>
      <hr />
      <nav className="link-container">
        <Link to="/forgot-password">
          <p>
            Forgot your account?<span> retrieve account</span>
          </p>
        </Link>
        <Link to="/">
          {" "}
          <p>
            Already have an account? <span>Log in</span>
          </p>
        </Link>
      </nav>
    </div>
  );
};

export default Register;
