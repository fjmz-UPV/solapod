
const API_KEY = "6f4Pao8iof4IDSg2QcHmVygvVasqLC5pcEV1fyPy";

/* Retorna la fecha de hoy con el formato "AAAA-MM-DD" */
function hoy() {
  const date  = new Date();
  const day   = date.getDate();
  const month = date.getMonth() + 1;
  const year  = date.getFullYear();
  const hoy   = `${year}-${((month<10)?"0":"")+month}-${((day<10)?"0":"")+day}`;
  return hoy;
}

// Algunas funciones originales de arranque 
function arranque() {
  console.log("hoy: " + hoy());
  document.getElementById("calendario").setAttribute("value", hoy());
}

// Actualiza la foto, la descripcion, el título y el autor de la APOD
function actualizar_pagina({url, explanation, title, copyright}) {
  document.getElementById("foto").setAttribute("src", url);
  document.querySelector("#descripcion span").innerHTML = explanation;
  document.querySelector("#titulo span").innerHTML = title;
  document.querySelector("#autor span").innerHTML = (copyright==undefined)?"anónimo":copyright;
}









