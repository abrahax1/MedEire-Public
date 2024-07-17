import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import checkPassword from "../helpers/checkPassword";

const UserURL = import.meta.env.VITE_USER_URL;

const NewPassword = () => {
  const [valid, setValid] = useState(false);
  const [validPass, setValidPass] = useState(false);

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});

  const params = useParams();
  const { token } = params;

  useEffect(() => {
    const resetPasswordByToken = async () => {
      try {
        const url = `${UserURL}forgot-password/${token}`;

        const resp = await fetch(url);
        const result = await resp.json();
        result.valid && setValid(true);
      } catch (error) {
        console.log(error);
        setValid(false);
      }
    };
    resetPasswordByToken();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { msg, error } = checkPassword(password, repeatPassword);

    if (msg) {
      setError(true);
      setAlert({ msg: msg, error: true });
      return;
    }

    setError(false);
    setAlert({});
    changePassword();
  };

  const changePassword = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      password: password,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const url = `${UserURL}forgot-password/${token}`;
      const resp = await fetch(url, requestOptions);
      const result = await resp.json();

      if (!result.error) {
        setAlert({
          msg: result.msg,
          error: false,
        });
        setPassword("");
        setRepeatPassword("");
        setValidPass(true);
        return;
      } else {
        setAlert({
          msg: result.msg,
          error: true,
        });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return valid ? (
    <div className="container">
      <h1>New Password</h1>

      {!validPass ? (
        <form className="form-contain" onSubmit={handleSubmit} noValidate>
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
            placeholder={`${
              error ? "Must include password" : "Repeat Password"
            }`}
            onChange={(e) => {
              setRepeatPassword(e.target.value), setError(false);
            }}
          />
          <br />

          {<Alert alert={alert} />}
          <input type="submit" value="Reset password" />
        </form>
      ) : (
        <Alert alert={alert} />
      )}

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
  ) : (
    <div className="container">
      <h1>Invalid Token</h1>

      <nav className="link-container">
        <Link to="/">
          {" "}
          <p>
            <span>Login</span>
          </p>
        </Link>
      </nav>
    </div>
  );
};

export default NewPassword;
