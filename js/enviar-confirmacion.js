document.getElementById('btnConfirmCorreo').addEventListener('click', async () => {
  const correo = document.getElementById('correo').value; // ya viene cargado del perfil o login

  const res = await fetch("http://127.0.0.1:5000/enviar_confirmacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo })
  });

  const data = await res.json();
  alert(data.mensaje);
});
