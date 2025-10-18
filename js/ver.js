document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordLogin = document.getElementById('see-login');
    const togglePasswordRegister = document.getElementById('see-register');
    const togglePasswordNew = document.getElementById('see-now');
    const passwordLogin = document.getElementById('password-login');
    const passwordRegister = document.getElementById('password-register');
    const passwordnew = document.getElementById('nueva_contrasena');

    if (togglePasswordLogin && passwordLogin) {
        togglePasswordLogin.addEventListener('click', function() {
            const type = passwordLogin.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordLogin.setAttribute('type', type);
            
            togglePasswordLogin.src = (type === 'password') ? '/image/visualizar.svg' : '/image/ocultar.svg';
        });
    }

    if (togglePasswordRegister && passwordRegister) {
        togglePasswordRegister.addEventListener('click', function() {
            const type = passwordRegister.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordRegister.setAttribute('type', type);
            togglePasswordRegister.src = (type === 'password') ? '/image/visualizar.svg' : '/image/ocultar.svg';
        });
    }
if (togglePasswordNew && passwordnew) {
    togglePasswordNew.addEventListener('click', function() {
        const type = passwordnew.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordnew.setAttribute('type', type);
        togglePasswordNew.src = (type === 'password') ? '/image/visualizar.svg' : '/image/ocultar.svg';
    });
}
});
