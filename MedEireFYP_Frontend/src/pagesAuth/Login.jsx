import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import checkEmail from "../helpers/checkEmail";
import Alert from "../components/Alert";
import useAuth from "../hooks/useAuth";
const UserURL = import.meta.env.VITE_USER_URL;

const Login = () => {
  const navigate = useNavigate();

  let [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState({});
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert({});

    if (!password || !email) {
      setError(true);
      setAlert({ msg: "type your information", error: true });
    } else if (checkEmail(email)) {
      checkEmail(email);
      const { msg, error } = checkEmail(email);
      setError(true);
      setAlert({ msg: msg, error: error });
      if (error === false) {
        requestLogin();
        setError(false);
      }
    }
    requestLogin();
  };

  const requestLogin = async () => {
    setLoading(true);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let raw = JSON.stringify({
      email: email.toLowerCase(),
      password: password,
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    try {
      const resp = await fetch(`${UserURL}login`, requestOptions);
      const result = await resp.json();

      setLoading(false);

      if (!result.msg) {
        localStorage.setItem("tokenAuthUser", result.token);
        setAuth(result);
        navigate("/home");
      }

      setAlert({
        msg: result.msg,
        error: true,
      });
    } catch (error) {
      console.log("Server error");
    }
  };

  return (
    <div className="container">
      <h1>
        Hi, <br /> Welcome!
      </h1>
      <form className="form-contain" onSubmit={handleSubmit}>
        <input
          type="text"
          className="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value), setError(false), setAlert({});
          }}
        />
        <br />
        <input
          type="password"
          className="pwd"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value), setError(false), setAlert({});
          }}
        />
        {<Alert alert={alert} />}
        {loading ? (
          <section id="chatApp" className="chatApp">
            <div className="chatApp__loaderWrapper">
              <div className="chatApp__loaderText">Loading...</div>
              <div className="chatApp__loader"></div>
            </div>
          </section>
        ) : (
          <input type="submit" value="Login" />
        )}
      </form>

      <nav className="link-container">
        <Link to="/forgot-password">
          <p>
            Forgot your password?<span> Retrieve account</span>
          </p>
        </Link>
        <Link to="register">
          {" "}
          <p>
            Don't have an account? <span>Create account</span>
          </p>
        </Link>
      </nav>
    </div>
  );
};

export default Login;
