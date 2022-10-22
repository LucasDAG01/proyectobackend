console.log("Websocket initializated");
const socketClient = io();

let user;

Swal.fire({
  title: "Bienvenido",
  text: "Ingresa tu Email",
  input: "email",
  allowOutsideClick: false,
}).then((respuesta) => {
  user = respuesta.value;
});

const campo = document.getElementById("messageField");

campo.addEventListener("keydown", (evt) => {
  console.log(evt.key);
  if (evt.key === "Enter") {
    const date = new Date();
    socketClient.emit("message", {
      username: user,
      date: date.toLocaleTimeString(),
      message: campo.value,
    });
  }
});

const messageContainer = document.getElementById("messageContainer");

socketClient.on("historico", (data) => {
  let elementos = "";
  data.forEach((item) => {
    elementos =
      elementos +
      `<p><FONT COLOR="blue"><strong>${item.username}</strong></FONT> <FONT COLOR="brown">${item.date}</FONT>: <FONT COLOR="green">${item.message}</FONT></p>`;
  });
  messageContainer.innerHTML = elementos;
});

socketClient.on("newUser", () => {
  Swal.fire({
    text: "nuevo usuario conectado",
    toast: true,
  });
});
