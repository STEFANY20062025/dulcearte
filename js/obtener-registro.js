document.addEventListener('DOMContentLoaded', () => {
  const btnRegistrar = document.getElementById('registrarse');

  btnRegistrar.addEventListener('click', async (e) => {
    e.preventDefault();

    // Obtener los valores de los inputs
    const correo = document.querySelector('#aparecers input[type="email"]').value.trim();
    const contrasena = document.querySelector('#password-register').value.trim();

    // Validación básica
    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
      
      } else {
        alert(`⚠️ ${data.mensaje}`);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("❌ Ocurrió un error al intentar registrarte.");
    }
  });
});
