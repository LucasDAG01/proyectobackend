import socketClient from io();

let user;

//**************//
// usuario

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
// schemas
const authorSchema = new normalizr.schema.Entity(
  "authors",
  {},
  { idAtribute: "email" }
);

const menssageSchema = new normalizr.schema.Entity("messages", {
  author: authorSchema,
});
const chatSchema = new normalizr.schema.Entity(
  "chat",
  {
    menssage: [menssageSchema],
  },
  { idAttribute: "id" }
);
// chat
socketClient.on("messages", async (dataMsg) => {
  // desnormalizar
  const normalData = normalizr.denormalize(
    dataMsg.result,
    chatSchema,
    dataMsg.entities
  );
  let messageElements = "";
  normalData.messages.forEach((msg) => {
    messageElements += `<div><strong>${msg.author.name} - ${msg.timestamp}:</strong> ${msg.text}</div>`;
  });
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML =
    normalData.messages.length > 0 ? messageElements : "";
});

//envio del mensaje del chat
const chatInput = document.getElementById("chatMsg");
const chatButton = document.getElementById("sendMsg");

chatButton.addEventListener("click", () => {
  socketClient.emit("newMessage", {
    author: user,
    text: chatInput.value,
    timestamp: new Date().toLocaleString(),
  });
  chatInput.value = "";
});
