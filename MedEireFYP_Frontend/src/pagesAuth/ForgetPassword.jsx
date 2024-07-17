import { Link } from "react-router-dom";
import { useState } from "react";
import Alert from "../components/Alert";
import checkEmail from "../helpers/checkEmail";
const UserURL = import.meta.env.VITE_USER_URL;

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const check = checkEmail(email);
    if (check) {
      setAlert({ msg: check.msg, error: check.error });
    } else {
      setError(false);
      setAlert({});
      requestRecover();
    }
  };

  const requestRecover = async () => {
    console.log("recover");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      email: email,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
      const resp = await fetch(`${UserURL}forgot-password`, requestOptions);
      const resul = await resp.json();
      if (resul) {
        setAlert({
          msg: resul.msg,
          error: resul.error,
        });
        resul.error === false && setEmail("");
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h1>Retrieve account</h1>
      <form className="form-contain" onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          value={email}
          className={`name ${error && email === "" && "error"}`}
          placeholder={`${error ? "must include email" : "Email"}`}
          onChange={(e) => {
            setEmail(e.target.value), setError(false), setAlert({});
          }}
        />
        {<Alert alert={alert} />}
        <input type="submit" value="Retrieve account" />
      </form>

      <nav className="link-container">
        <Link to="/">
          {" "}
          <p>
            Already have an account? <span>Login</span>
          </p>
        </Link>
        <Link to="/register">
          {" "}
          <p>
            Don't have an account? <span>Create account</span>
          </p>
        </Link>
      </nav>
    </div>
  );
};

export default ForgetPassword;
