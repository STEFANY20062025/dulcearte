let carrito = [];

try {
  const data = JSON.parse(localStorage.getItem("carrito"));
  // Validar que sea un array y que sus elementos tengan estructura válida
  if (Array.isArray(data)) {
    carrito = data.filter(p => p && p.id && p.nombre && p.precio && p.imagen);
  }
} catch {
  carrito = [];
}

// 🔹 Guardar en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// 🔹 Abrir / cerrar carrito
function abrirCarrito() {
  document.getElementById("carritoSidebar").style.right = "0";
  document.getElementById("carritoOverlay").style.display = "block";
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById("carritoSidebar").style.right = "-360px";
  document.getElementById("carritoOverlay").style.display = "none";
}

// 🔹 Agregar producto
function agregarAlCarrito(nombre, precio, imagen, id, stock = 1) {
  if (!nombre || !precio || !imagen || !id) return;

  const item = carrito.find(p => p.id === id);

  if (item) {
    if (item.cantidad < stock) {
      item.cantidad++;
    } else {
      mostrarModalStock(`Solo hay ${stock} unidad${stock > 1 ? 'es' : ''} disponible(s) de este producto.`);
      return;
    }
  } else {
    carrito.push({ id, nombre, precio, imagen, cantidad: 1, stock });
  }

  guardarCarrito();
  renderCarrito();
}



// 🔹 Quitar producto
function quitarDelCarrito(nombre) {
  carrito = carrito.filter(p => p.nombre !== nombre);
  guardarCarrito();
  renderCarrito();
}

// 🔹 Cambiar cantidad
function cambiarCantidad(nombre, delta) {
  const item = carrito.find(p => p.nombre === nombre);
  if (item) {
    if (delta > 0 && item.cantidad >= item.stock) {
      mostrarModalStock(`Stock máximo alcanzado: ${item.stock} unidades.`);
      return;
    }

    item.cantidad += delta;

    if (item.cantidad <= 0) {
      quitarDelCarrito(nombre);
    } else {
      guardarCarrito();
      renderCarrito();
    }
  }
}


// 🔹 Formatear precio
function formatearCOP(valor) {
  return "COP " + Number(valor).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 🔹 Renderizar carrito
function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalElem = document.getElementById("carrito-total");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío 🛒</p>";
    totalElem.textContent = "COP 0,00";
    return;
  }

  let total = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("carrito-item");
    itemDiv.innerHTML = `
      <div class="carrito-info" onclick="irAPersonalizar(${item.id})">
        <img src="${item.imagen}" alt="${item.nombre}">
        <div class="carrito-texto">
          <h4>${item.nombre}</h4>
          <p>${formatearCOP(item.precio)} x ${item.cantidad}</p>
        </div>
      </div>
      <div class="carrito-controls">
        <button onclick="cambiarCantidad('${item.nombre}', 1)">+</button>
        <button onclick="cambiarCantidad('${item.nombre}', -1)">−</button>
        <button onclick="quitarDelCarrito('${item.nombre}')">🗑️</button>
      </div>
    `;

    contenedor.appendChild(itemDiv);
  });

  totalElem.textContent = formatearCOP(total);
}

// 🔹 Ir a la página de personalizar
function irAPersonalizar(id) {
  window.location.href = `personalizar.html?id=${id}`;
}

// 🔹 Mostrar modal de stock insuficiente
function mostrarModalStock() {
  const modal = document.getElementById("modalStock");
  modal.style.display = "flex";

  const btnCerrar = document.getElementById("cerrarModal");
  btnCerrar.onclick = () => {
    modal.style.display = "none";
  };

  // Cerrar al hacer clic fuera del modal
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Render inicial
renderCarrito();
