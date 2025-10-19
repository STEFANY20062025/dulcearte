document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productosGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  let productos = [];


  async function cargarProductos() {
    try {
      const res = await fetch('http://127.0.0.1:5000/productos');
      const data = await res.json();

      if (data.status === 'ok') {
        productos = data.productos;
        renderizarProductos(productos);
      } else {
        grid.innerHTML = '<p>Error al cargar productos.</p>';
      }
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
  }

  // 🔹 Renderizar productos en el HTML
  function renderizarProductos(lista) {
    grid.innerHTML = '';
    if (lista.length === 0) {
      grid.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    lista.forEach(p => {
      const card = document.createElement('div');
      card.className = 'producto';
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio}</p>
        <button class="btn-agregar">AGREGAR 🛒</button>
      `;
      card.addEventListener('click', () => {
        window.location.href = '/producto/' + p.id;
      });
      grid.appendChild(card);
    });
  }

  // 🔹 Filtrar productos por nombre
  function filtrarProductos() {
    const filtro = searchInput.value.trim().toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
    renderizarProductos(filtrados);
  }

  searchBtn.addEventListener('click', filtrarProductos);
  searchInput.addEventListener('input', filtrarProductos);

  // Cargar al iniciar
  cargarProductos();
});
