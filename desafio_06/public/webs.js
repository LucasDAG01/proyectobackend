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
