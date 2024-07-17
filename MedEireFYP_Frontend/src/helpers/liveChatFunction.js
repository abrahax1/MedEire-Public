export const sendMessage = (
  senderID,
  receiverId,
  setAlert,
  socketRef,
  users
) => {
  const msgerForm = document.querySelector(".msger-inputarea");
  const msgerInput = document.getElementById("message-to-send");
  const textArea = document.getElementById("message-to-send");

  textArea.addEventListener("keydown", (event) => {
    if (event.code === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.target.form.dispatchEvent(
        new Event("submit", { cancelable: true })
      );
    }
  });

  msgerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const msgText = msgerInput.value;

    if (!msgText) return;

    const body = {
      senderID: senderID,
      receiverID: receiverId,
      message: msgText,
    };

    socketRef.current.emit("message", body);
    appendMessage(body, senderID, users);
    msgerInput.value = "";
    setAlert({ msg: "", error: false });
  });
};

export function appendMessage(text, id, users) {
  const { senderID, message } = text;
  const doctor = users.find((user) => user.id === senderID);
  const name = doctor ? `${doctor.name} ${doctor.surname}` : "Unknown user";

  //   Simple solution for small apps
  const msgHTML = `
  <li class="clearfix">
  <div class="message-data ${id == senderID ? "" : "align-right"} ">
  <span class="message-data-time">${formatDate(new Date())}</span> &nbsp;
    &nbsp;
    <span class="message-data-name">${name}</span>
    <i class="fa fa-circle me"></i>
  </div>
  <div class="message ${
    senderID == id ? "my-message" : "other-message"
  } float-right">${message}</div>
    </li>
  `;

  const chatOpen = document.getElementById("container-chat-ul");
  const msgerChat = document.getElementById("container-chat-history");

  chatOpen.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

export function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}
