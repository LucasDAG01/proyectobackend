const faker = require("@faker-js/faker");
const { commerce, image } = faker;

for (let i = 0; i < 5; i++) {
  arrayProd.push({
    nombre: commerce.productName(),
    Precio: commerce.price(100, 5000),
    foto: image.technics(),
  });
  console.log(arrayProd);
}
