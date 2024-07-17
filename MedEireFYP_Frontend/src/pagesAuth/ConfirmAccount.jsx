import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
const UserURL = import.meta.env.VITE_USER_URL;

const ConfirmAccount = () => {
  const params = useParams();
  const { id } = params;
  const [msgServer, setMsgServer] = useState("");

  useEffect(() => {
    const confirmAccount = async () => {
      try {
        const url = `${UserURL}confirm/${id}`;
        const resp = await fetch(url);
        const result = await resp.json();

        result && setMsgServer(result.msg);
      } catch (error) {
        setMsgServer("Error on confirmation");
      }
    };
    confirmAccount();
  }, []);

  return (
    <div>
      <h2>{msgServer ? msgServer : "Invalid token"}</h2>
      <nav className="link-container">
        <Link to="/">
          {" "}
          <p>
            <span>Log in</span>
          </p>
        </Link>
      </nav>
    </div>
  );
};

export default ConfirmAccount;
