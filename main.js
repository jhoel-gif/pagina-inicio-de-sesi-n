// Expresiones regulares
const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const regexCelular = /^[0-9]{7,12}$/;

// Elementos DOM
const formRegistro = document.getElementById('formRegistro');
const formLogin = document.getElementById('formLogin');
const formRecuperar = document.getElementById('formRecuperar');
const mensajeRegistro = document.getElementById('mensajeRegistro');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRecuperar = document.getElementById('mensajeRecuperar');

const registroDiv = document.getElementById('registro');
const loginDiv = document.getElementById('login');
const recuperarDiv = document.getElementById('recuperar');

const recuperarLink = document.getElementById('recuperarLink');

// Variable global para correo activo en recuperación
let correoRecuperacion = "";

// Mostrar/Ocultar contraseña
document.getElementById('mostrarPassRegistro').addEventListener('change', function() {
    document.getElementById('password').type = this.checked ? 'text' : 'password';
});
document.getElementById('mostrarPassLogin').addEventListener('change', function() {
    document.getElementById('loginPassword').type = this.checked ? 'text' : 'password';
});
document.getElementById('mostrarPassRecuperar').addEventListener('change', function() {
    document.getElementById('nuevaPassword').type = this.checked ? 'text' : 'password';
});

// Variables de almacenamiento (simulación local)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
let intentosFallidos = JSON.parse(localStorage.getItem('intentosFallidos')) || {};

// --- Registro ---
formRegistro.addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('usuario').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const password = document.getElementById('password').value;

    if (!regexNombre.test(nombre)) return mensajeRegistro.textContent = "Nombre inválido.";
    if (!regexCorreo.test(correo)) return mensajeRegistro.textContent = "Correo inválido.";
    if (!regexCelular.test(celular)) return mensajeRegistro.textContent = "Celular inválido.";
    if (!regexPassword.test(password)) return mensajeRegistro.textContent = "Contraseña insegura.";

    if (usuarios[correo]) return mensajeRegistro.textContent = "Usuario ya registrado.";

    usuarios[correo] = { nombre, correo, celular, password, bloqueado: false };
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    mensajeRegistro.style.color = 'green';
    mensajeRegistro.textContent = "Cuenta creada exitosamente.";

    formRegistro.reset();
});

// --- Login ---
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();

    const correo = document.getElementById('loginUsuario').value.trim();
    const password = document.getElementById('loginPassword').value;

    const user = usuarios[correo];
    if (!user) {
        mensajeLogin.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    if (user.bloqueado) {
        mensajeLogin.textContent = "Cuenta bloqueada por intentos fallidos.";
        return;
    }

    intentosFallidos[correo] = intentosFallidos[correo] || 0;

    if (user.password === password) {
        mensajeLogin.style.color = 'green';
        mensajeLogin.textContent = `Bienvenido al sistema, ${user.nombre}`;
        intentosFallidos[correo] = 0;
    } else {
        intentosFallidos[correo]++;
        if (intentosFallidos[correo] >= 3) {
            user.bloqueado = true;
            mensajeLogin.textContent = "Cuenta bloqueada por intentos fallidos.";
        } else {
            mensajeLogin.textContent = "Usuario o contraseña incorrectos.";
        }
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('intentosFallidos', JSON.stringify(intentosFallidos));
});

// --- Mostrar formulario de recuperación ---
recuperarLink.addEventListener('click', function(e) {
    e.preventDefault();
    const correo = document.getElementById('loginUsuario').value.trim();
    if (!correo || !usuarios[correo]) {
        mensajeLogin.textContent = "Ingrese un correo válido para recuperar contraseña.";
        return;
    }
    correoRecuperacion = correo; // guardamos correo activo
    loginDiv.style.display = 'none';
    recuperarDiv.style.display = 'block';
});

// --- Recuperar contraseña ---
formRecuperar.addEventListener('submit', function(e) {
    e.preventDefault();

    const nuevaPassword = document.getElementById('nuevaPassword').value;

    if (!regexPassword.test(nuevaPassword)) {
        mensajeRecuperar.textContent = "Contraseña insegura.";
        return;
    }

    if (!usuarios[correoRecuperacion]) {
        mensajeRecuperar.textContent = "Usuario no encontrado.";
        return;
    }

    usuarios[correoRecuperacion].password = nuevaPassword;
    usuarios[correoRecuperacion].bloqueado = false;
    intentosFallidos[correoRecuperacion] = 0;

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('intentosFallidos', JSON.stringify(intentosFallidos));

    mensajeRecuperar.style.color = 'green';
    mensajeRecuperar.textContent = "Contraseña actualizada. Ahora puede iniciar sesión.";

    formRecuperar.reset();
    setTimeout(() => {
        recuperarDiv.style.display = 'none';
        loginDiv.style.display = 'block';
        mensajeRecuperar.textContent = '';
    }, 2000);
});
