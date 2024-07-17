import React, { useEffect, useState, useRef } from "react";
import {
  formatDate,
  sendMessage,
  appendMessage,
} from "../helpers/liveChatFunction";
import { sendRequest } from "../helpers/request";
import useAuth from "../hooks/useAuth";
import Alert from "../components/Alert";
import { io } from "socket.io-client";
import avatars from "../assets/Avatars/avatars.js";

const AppointmentURL = import.meta.env.VITE_Appointment_URL;
const ChatURL = import.meta.env.VITE_Chat_URL;
const URL = import.meta.env.VITE_URL;

const LiveChat = () => {
  const [chatList, setChatList] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [alert, setAlert] = useState({
    msg: "",
    error: false,
  });
  const { auth } = useAuth();
  const socketRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("tokenAuthUser");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let requestOptions = {
      headers: headers,
    };

    const getUsers = async () => {
      const doctors = await sendRequest(
        `${AppointmentURL}doctors`,
        requestOptions
      );
      setUsers(doctors.data.doctors);
    };

    getUsers();
  }, []);

  const getAvatar = (index) => {
    return avatars[`avatar${index + 1}`];
  };

  useEffect(() => {
    // Connect to the server
    socketRef.current = io(`${URL}`);

    // Listen to incoming messages
    socketRef.current.on("message", (message) => {
      appendMessage(message, auth.id, users);
    });

    socketRef.current.on("chat history", (history) => {
      updateChatHistory(history);
    });

    // Cleanup
    return () => {
      socketRef.current.disconnect();
    };
  }, [users]);

  const updateChatHistory = (history) => {
    const chatHistoryElement = document.getElementById("container-chat-ul");

    if (chatHistoryElement) {
      chatHistoryElement.innerHTML = history
        .map((e) => {
          const doctor = users.find((user) => user.id === e.senderID);
          const name = doctor
            ? `${doctor.name} ${doctor.surname}`
            : "Unknown user";

          return `<li class="clearfix">
          <div class="message-data ${
            e.senderID == auth.id ? "" : "align-right"
          } ">
            <span class="message-data-time">${formatDate(
              new Date(e.dateCreate)
            )}</span> &nbsp;
            &nbsp;
            <span class="message-data-name">${name}</span>
            <i class="fa fa-circle me"></i>
          </div>
          <div class="message ${
            e.senderID == auth.id ? "my-message" : "other-message"
          }   float-right">${e.message}</div>
        </li>`;
        })
        .join("");
    }

    const msgerChat = document.getElementById("container-chat-history");
    msgerChat.scrollTop = msgerChat.scrollHeight;
  };

  const handlerChatOpen = (e, receiver) => {
    setChatOpen(true);
    socketRef.current.emit("join room", {
      senderID: auth.id,
      receiverID: receiver,
    });

    const receiverUser = users.find((user) => user.id === receiver);
    const receiverName = receiverUser
      ? `${receiverUser.name} ${receiverUser.surname}`
      : "Unknown User";

    setAlert({ msg: "", error: false });
    const html = `<div class="chat-header clearfix">
    <img src=""/>
    
      <div class="chat-about">
        <div class="chat-with">Chat with ${receiverName}</div>
      </div>

      <i class="fa fa-star"></i>
    </div>

    <div id="container-chat-history" class="chat-history">
      <div id="container-chat-ul">
        ${e
          .map(
            (e) =>
              `<li class="clearfix">
              <div class="message-data ${
                e.senderID == auth.id ? "" : "align-right"
              } ">
                <span class="message-data-time">${formatDate(
                  new Date(e.dateCreate)
                )}</span> &nbsp;
                &nbsp;
                <span class="message-data-name">${e.senderID}</span>
                <i class="fa fa-circle me"></i>
              </div>
              <div class="message ${
                e.senderID == auth.id ? "my-message" : "other-message"
              }   float-right">${e.message}</div>
            </li>`
          )
          .join("")}
      </div>
    </div>

    <form class="chat-message clearfix msger-inputarea">
      <textarea
        name="message-to-send"
        id="message-to-send"
        placeholder="Type your message"
        rows="3"
      ></textarea>
      
      <i class="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;

      <i class="fa fa-file-image-o"></i>

      <button type="submit" class="msger-send-btn">Send</button>
    </form>`;

    const chatOpen = document.getElementById("chat-open");
    chatOpen.innerHTML = html;

    sendMessage(auth.id, receiver, setAlert, socketRef, users);
  };

  return (
    <>
      <Alert alert={alert} />
      <div className="container-live-chat clearfix">
        <div className="people-list" id="people-list">
          <div className="search">
            <input type="text" placeholder="search" />
            <i className="fa fa-search"></i>
          </div>
          <ul className="list">
            {users.map((user, index) => {
              const { id, name, surname } = user;
              const chat = chatList.find(
                (chat) => chat.senderID === id || chat.receiverID === id
              );
              const messages = chat ? chat.messages : [];
              const avatar = getAvatar(index);
              return (
                <li
                  key={id}
                  className="clearfix chat-list"
                  onClick={() => handlerChatOpen(messages, id)}
                >
                  <img src={avatar} />
                  <div className="about">
                    <div className="name">{`${name} ${surname}`}</div>
                    <div className="status">
                      <i className="fa fa-circle online"></i> online
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div id="chat-open" className="chat"></div>
      </div>
    </>
  );
};

export default LiveChat;
