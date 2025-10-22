document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productosGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  let productos = [];

  // 🔹 Cargar productos desde el backend
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
      grid.innerHTML = '<p>Esperando los productos. 404</p>';
    }
  }

  // 🔹 Formato de moneda
  function formatearCOP(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) return 'COP 0,00';
    return 'COP ' + numero.toLocaleString('es-CO', { minimumFractionDigits: 2 });
  }

  // 🔹 Renderizar productos
  function renderizarProductos(lista) {
    grid.innerHTML = '';
    if (!lista || lista.length === 0) {
      grid.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    lista.forEach(p => {
      const card = document.createElement('div');
      card.className = 'producto';
      const agotado = p.disponible === 0;

      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="precio">${formatearCOP(p.precio)}</p>
        <p class="estado ${agotado ? 'agotado-texto' : 'disponible-texto'}">
          ${agotado ? 'Agotado' : 'Disponible'}
        </p>
        <button class="btn-agregar ${agotado ? 'agotado' : ''}" ${agotado ? 'disabled' : ''}>
          ${agotado ? 'No disponible' : 'AGREGAR 🛒'}
        </button>
      `;

      // 🔹 Redirección al producto
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar')) return;
        window.location.href = `personalizar.html?id=${p.id}`;
      });

      // 🔹 Activar botón "AGREGAR 🛒"
      const btnAgregar = card.querySelector('.btn-agregar');
      if (!agotado) {
        btnAgregar.addEventListener('click', (e) => {
          e.stopPropagation(); // evita abrir personalizar
          agregarAlCarrito(p.nombre, p.precio, p.imagen, p.id, p.disponible);

          btnAgregar.classList.add('agregado');
          btnAgregar.textContent = '✅ Agregado!';
          setTimeout(() => {
            btnAgregar.classList.remove('agregado');
            btnAgregar.textContent = 'AGREGAR 🛒';
          }, 1000);
        });
      }

      grid.appendChild(card);
    });
  }

  // 🔹 Filtrar productos por categoría o subcategoría
function filtrarPorCategoria(filtro) {
  if (!productos || productos.length === 0) return;

  // 🔹 Si filtro es "todo", mostramos todos los productos
  if (filtro.toLowerCase() === 'todo') {
    renderizarProductos(productos);
    return;
  }

  const filtrados = productos.filter(p =>
    p.categoria?.toLowerCase() === filtro.toLowerCase() ||
    p.subcategoria?.toLowerCase() === filtro.toLowerCase()
  );

  renderizarProductos(filtrados);
}

  // 🔹 Manejo de clics en categorías
  const categorias = document.querySelectorAll('.cat-item');
  const subcategorias = document.querySelectorAll('.cat-sub li');

  categorias.forEach(cat => {
    cat.addEventListener('click', e => {
      if (e.target.closest('.cat-sub')) return;
      const categoria = cat.dataset.cat;
      if (categoria) {
        filtrarPorCategoria(categoria);
        categorias.forEach(c => c.classList.remove('seleccionado'));
        cat.classList.add('seleccionado');
      }
    });
  });

  // 🔹 Clic en subcategorías
  subcategorias.forEach(sub => {
    sub.addEventListener('click', e => {
      e.stopPropagation();
      const subcat = e.target.textContent.trim();
      if (subcat) {
        filtrarPorCategoria(subcat);
        subcategorias.forEach(s => s.classList.remove('seleccionado-sub'));
        sub.classList.add('seleccionado-sub');
      }
    });
  });

  // 🔹 Buscar productos
  function filtrarProductos() {
    const filtro = searchInput.value.trim().toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
    renderizarProductos(filtrados);
  }

  searchBtn.addEventListener('click', filtrarProductos);
  searchInput.addEventListener('input', filtrarProductos);

  // 🔹 Iniciar carga
  cargarProductos();
});

