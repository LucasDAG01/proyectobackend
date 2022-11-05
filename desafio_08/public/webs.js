const socketClient = io();

// nuevo usuario
let user;

Swal.fire({
  title: "Bienvenido",
  text: "Ingresa tu Email",
  input: "email",
  allowOutsideClick: false,
}).then((respuesta) => {
  user = respuesta.value;
});

// lista
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const product = {
    title: document.getElementById("title").value,
    price: document.getElementById("price").value,
    thumbnail: document.getElementById("thumbnail").value,
  };
  socketClient.emit("newProduct", product);
  productForm.reset();
});

//productos en tiempo real
const createTable = async (data) => {
  const response = await fetch("./template/table.hbs");
  const result = await response.text();
  const template = Handlebars.compile(result);
  const html = template({ products: data });
  return html;
};

socketClient.on("products", async (data) => {
  const htmlTable = await createTable(data);
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = htmlTable;
});

// chat
socketClient.on("messages", async (dataMsg) => {
  let messageElements = "";
  dataMsg.forEach((msg) => {
    messageElements += `<div><strong>${msg.user} - ${msg.timestamp}:</strong> ${msg.message}</div>`;
  });
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = dataMsg.length > 0 ? messageElements : "";
});

//envio del mensaje del chat
const chatInput = document.getElementById("chatMsg");
const chatButton = document.getElementById("sendMsg");

chatButton.addEventListener("click", () => {
  socketClient.emit("newMessage", {
    user: user,
    timestamp: new Date().toLocaleString(),
    message: chatInput.value,
  });
  chatInput.value = "";
});
