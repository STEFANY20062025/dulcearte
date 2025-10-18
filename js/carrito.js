
let carrito = [];

// Abrir / cerrar carrito
function abrirCarrito() {
  document.getElementById("carritoSidebar").style.right = "0";
  document.getElementById("carritoOverlay").style.display = "block";
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById("carritoSidebar").style.right = "-360px";
  document.getElementById("carritoOverlay").style.display = "none";
}

// Agregar producto
function agregarAlCarrito(nombre, precio, imagen) {
  const item = carrito.find(p => p.nombre === nombre);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
  }
  renderCarrito();
}

// Quitar producto
function quitarDelCarrito(nombre) {
  carrito = carrito.filter(p => p.nombre !== nombre);
  renderCarrito();
}

// Cambiar cantidad
function cambiarCantidad(nombre, delta) {
  const item = carrito.find(p => p.nombre === nombre);
  if (item) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      quitarDelCarrito(nombre);
    } else {
      renderCarrito();
    }
  }
}

// Renderizar carrito
function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalElem = document.getElementById("carrito-total");
  contenedor.innerHTML = "";

  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    contenedor.innerHTML += `
      <div class="carrito-item">
        <img src="${item.imagen}" alt="${item.nombre}">
        <div class="carrito-info">
          <h4>${item.nombre}</h4>
          <p>$${item.precio} x ${item.cantidad}</p>
        </div>
        <div class="carrito-controls">
          <button onclick="cambiarCantidad('${item.nombre}', 1)">+</button>
          <button onclick="cambiarCantidad('${item.nombre}', -1)">-</button>
          <button onclick="quitarDelCarrito('${item.nombre}')">🗑</button>
        </div>
      </div>
    `;
  });

  totalElem.textContent = "$" + total.toFixed(2);
}

