let abrirsesion = document.getElementById("botoncin");
let over = document.getElementById("aparecerr");
let popi = document.getElementById("popis");
let cerrar = document.getElementById("cerrar");

abrirsesion.addEventListener("click", function () {
    over.classList.add("active");
    popi.classList.add("active");
});

cerrar.addEventListener("click", function (e) {
    e.preventDefault();
    over.classList.remove("active");
    popi.classList.remove("active");
});



let abrirregistro = document.getElementById("regi");
let cuadro = document.getElementById("aparecers");
let temu = document.getElementById("popir");
let cerrarregistro = document.getElementById("cerrarr");
let iniciar = document.getElementById("ini");

abrirregistro.addEventListener("click", function () {
    cuadro.classList.add("active");
    temu.classList.add("active");
    over.classList.remove("active");
    popi.classList.remove("active");
});

cerrarregistro.addEventListener("click", function (i) {
    i.preventDefault();
    cuadro.classList.remove("active");
    temu.classList.remove("active");
});

iniciar.addEventListener("click", function () {
    over.classList.add("active");
    popi.classList.add("active");
    cuadro.classList.remove("active");
    temu.classList.remove("active");
});

