// ---------------------------------------------
// PERFIL.JS — Manejo completo del perfil de usuario
// ---------------------------------------------
const API_URL = "http://127.0.0.1:5000";
const botonUsuario = document.getElementById("botoncin");
const modalPerfil = document.getElementById("modalPerfil");
const formPerfil = document.getElementById("formPerfil");

// ================================
// 🔹 Verificar sesión del usuario
// ================================
async function verificarSesion() {
  try {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioLocal || !usuarioLocal.id) {
      console.log("⚠️ No hay sesión activa en localStorage.");
      cambiarBotonModoLogin();
      return null;
    }

    const res = await fetch(`${API_URL}/validar_usuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: usuarioLocal.id }),
    });

    const data = await res.json();

    if (data.status === "ok") {
      console.log("✅ Sesión válida:", usuarioLocal);
      cambiarBotonModoPerfil(usuarioLocal);
      return usuarioLocal;
    } else {
      console.warn("❌ Sesión inválida. Limpiando datos...");
      localStorage.removeItem("usuario");
      cambiarBotonModoLogin();
      return null;
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    cambiarBotonModoLogin();
    return null;
  }
}

function cerrarSesion() {
  if (confirm("¿Seguro que quieres cerrar sesión?")) {
    localStorage.clear();
    window.location.href = '/index.html';
  }
}



// ================================
// 🔹 Cambiar comportamiento del botón
// ================================
function cambiarBotonModoPerfil(usuario) {
  if (!botonUsuario) return;

  // Elimina eventos anteriores
  botonUsuario.replaceWith(botonUsuario.cloneNode(true));
  const nuevoBoton = document.getElementById("botoncin");

  nuevoBoton.addEventListener("click", () => {
    abrirModalPerfil(usuario);
  });

  console.log("👤 Botón configurado para abrir el perfil.");
}

function cambiarBotonModoLogin() {
  const botonUsuario = document.getElementById("botoncin");
  if (!botonUsuario) {
    console.error("❌ No se encontró el botón con id 'botoncin'.");
    return;
  }

  // 🔹 Elimina cualquier listener previo
  const nuevoBoton = botonUsuario.cloneNode(true);
  botonUsuario.parentNode.replaceChild(nuevoBoton, botonUsuario);

  // 🔹 Asigna el nuevo evento
  nuevoBoton.addEventListener("click", () => {
  over.classList.add("active");
  popi.classList.add("active");
});


  console.log("✅ Botón de usuario configurado para abrir el login.");
}

// ================================
// 🔹 Obtener datos del perfil
// ================================
async function obtenerPerfil(usuario_id) {
  try {
    const res = await fetch(`${API_URL}/perfil/${usuario_id}`);
    const data = await res.json();

    if (data.status === "ok") {
      console.log("📄 Perfil obtenido:", data.usuario);
      mostrarDatosPerfil(data.usuario);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    } else {
      alert("⚠️ No se pudo obtener el perfil: " + data.mensaje);
    }
  } catch (error) {
    console.error("Error al obtener perfil:", error);
  }
}

// ================================
// 🔹 Mostrar los datos en el formulario
// ================================
function mostrarDatosPerfil(usuario) {
  // 🔹 Primero verificamos si el usuario existe
  if (!usuario) {
    console.warn("⚠️ No se recibió información del usuario");
    return;
  }

  // 🔹 Luego seleccionamos los elementos del DOM
  const estadoCorreo = document.getElementById("estadoCorreo");
  const btnConfirmarCorreo = document.getElementById("btnConfirmarCorreo");

  // 🔹 Muestra u oculta el botón según el estado del correo
  if (usuario.confirmado === 1 || usuario.confirmado === true) {
    // algunos backends envían 1/0 en vez de true/false
    estadoCorreo.textContent = "Correo confirmado ✅";
    estadoCorreo.style.color = "green";
    if (btnConfirmarCorreo) btnConfirmarCorreo.style.display = "none";
  } else {
    estadoCorreo.textContent = "Correo no confirmado ❌";
    estadoCorreo.style.color = "red";
    if (btnConfirmarCorreo) btnConfirmarCorreo.style.display = "inline-block";
  }

  // 🔹 Cargamos los datos del usuario en los campos
  document.getElementById("correo").value = usuario.correo || "";
  document.getElementById("nombre").value = usuario.nombre || "";
  document.getElementById("apellido").value = usuario.apellido || "";
  document.getElementById("documento").value = usuario.documento || "";
  document.getElementById("tipoDocumento").value = usuario.tipo_documento || "";
  document.getElementById("direccion").value = usuario.direccion || "";
  document.getElementById("celular").value = usuario.celular || "";
}


// ================================
// 🔹 Abrir / Cerrar modal
// ================================
function abrirModalPerfil(usuario) {
  obtenerPerfil(usuario.id);
  modalPerfil.classList.add("activo");
}

function cerrarModalPerfil() {
  modalPerfil.classList.remove("activo");
}

// ================================
// 🔹 Guardar cambios del perfil
// ================================
formPerfil.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) return alert("⚠️ No hay sesión activa.");

  // Obtener valor del select correctamente
  const tipoDocumentoSelect = document.getElementById("tipoDocumento");
  const tipoDocumento = tipoDocumentoSelect.value;

  if (!tipoDocumento) {
    alert("⚠️ Debes seleccionar un tipo de documento.");
    return;
  }

  const datos = {
    usuario_id: usuario.id,
    contrasena: document.getElementById("contrasena").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    documento: document.getElementById("documento").value.trim(),
    tipo_documento: tipoDocumento, // 👈 valor correcto del select
    direccion: document.getElementById("direccion").value.trim(),
    celular: document.getElementById("celular").value.trim(),
  };

  try {
    const res = await fetch(`${API_URL}/perfil/actualizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();
    if (data.status === "ok") {
      alert("✅ Perfil actualizado correctamente.");
      await obtenerPerfil(usuario.id); // refrescar datos
    } else {
      alert("⚠️ " + data.mensaje);
    }
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
  }
});


// ================================
// 🔹 Inicialización
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  await verificarSesion();
});
