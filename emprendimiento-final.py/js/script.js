function abrirMenu() {
    document.getElementById('sidebar').style.left = '0px';
    document.getElementById('overlay').style.display = 'block';
}

function cerrarMenu() {
    document.getElementById('sidebar').style.left = '-290px';
    document.getElementById('overlay').style.display = 'none';
}

function abrirLogin() {
    alert("Aquí iría el formulario de login.");
}

function abrirCarrito() {
    alert("Tu carrito está vacío.");
}
