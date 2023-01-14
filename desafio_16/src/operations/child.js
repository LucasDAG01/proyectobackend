//solo cuando trabajemos con modulos de es6
process.send("ok"); //proceso hijo listo para trabajar

////recibimos los mensajes del proceso padre.
process.on("message", (parentMsg) => {
  // console.log("parentMsg", parentMsg);
  if (parentMsg) {
    const resultados = {};
    for (let index = 0; index < parentMsg; index++) {
      const numeroAleatorio = parseInt(Math.random() * 1000 + 1); //18
      if (resultados[numeroAleatorio]) {
        resultados[numeroAleatorio]++;
      } else {
        resultados[numeroAleatorio] = 1;
      }
    }
    process.send(resultados);
  } else {
    const resultados = {};
    for (let index = 0; index < 100000000; index++) {
      const numeroAleatorio = parseInt(Math.random() * 1000 + 1); //18
      if (resultados[numeroAleatorio]) {
        resultados[numeroAleatorio]++;
      } else {
        resultados[numeroAleatorio] = 1;
      }
    }
    process.send(resultados);
  }
});
