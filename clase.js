// constructor de objeto
class Usuario {
  constructor(nombre, apellido, libros, mascotas) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.libros = libros;
    this.mascotas = mascotas;
    this.contadorIndividual = 0;
    this.titulos = [];
  }
  getFullName() {
    return `${this.nombre} ${this.apellido}`;
  }
  addMascota(nombre) {
    const newMascota = { nombre: nombre };
    this.contadorIndividual++;
    this.mascotas.push(newMascota);
  }
  countMascotas() {
    return this.contadorIndividual;
  }
  addBook(nombre, autor) {
    const newBook = { nombre: nombre, autor: autor };
    const newTitulo = nombre;
    this.libros.push(newBook);
    this.titulos.push(newTitulo);
  }
  getBookNames() {
    return this.titulos;
  }
}
// se crea objeto instancia usuario
const usuario1 = new Usuario("Lucas", "Acosta", [], []);
// aca se imprime el nombre completo del usuario
console.log(usuario1.getFullName());

// aca se carga los nombres de las mascotas y se suma en 1 el contador automaticamente (por cada nombre)
usuario1.addMascota("Firulais");
usuario1.addMascota("Sergio");

// aca se imprime la cantidad de mascotas
console.log(usuario1.countMascotas());

// aca se carga los libros del usuario
usuario1.addBook("Aguas vivas", "editorial 1");
usuario1.addBook("El señor", "editorial 2");

// aca se imprime los nombres de los libros
console.log(usuario1.getBookNames());
