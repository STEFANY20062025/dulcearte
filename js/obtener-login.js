document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.querySelector(".login");

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    const correo = document.querySelector('input[type="email"]').value.trim();
    const contrasena = document.getElementById("password-login").value.trim();

    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: correo,
          contrasena: contrasena
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Login exitoso
        alert(data.mensaje || "Inicio de sesión exitoso");
        
        // Guardar datos de sesión en el navegador si quieres
        localStorage.setItem("usuario_correo", correo);

        // Redirigir (ajusta la URL según tu app)
        window.location.href = "/html/productos.html"; 
      } else {
        // ❌ Error (correo o contraseña incorrectos, etc.)
        alert(data.mensaje || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Error de conexión. Verifica que el servidor Flask esté en ejecución.");
    }
  });
});
