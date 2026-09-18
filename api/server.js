// ======================================================
// API GamaSistem - Donde Omar
// Servicio web para registro e inicio de sesión
// ======================================================

// Importar las dependencias necesarias
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Crear la aplicación Express
const app = express();

// Puerto donde funcionará la API
const PORT = 3000;

// Permitir recibir información en formato JSON
app.use(express.json());

// Permitir solicitudes desde el Front-End
app.use(cors());

// Ruta del archivo donde se almacenan los usuarios
const archivoUsuarios = path.join(
    __dirname,
    "data",
    "users.json"
);


// ======================================================
// FUNCIÓN: obtenerUsuarios
// Lee los usuarios almacenados en users.json
// ======================================================

function obtenerUsuarios() {

    // Verificar si existe el archivo
    if (!fs.existsSync(archivoUsuarios)) {
        return [];
    }

    // Leer el contenido del archivo
    const contenido = fs.readFileSync(
        archivoUsuarios,
        "utf8"
    );

    // Si el archivo está vacío, devolver una lista vacía
    return contenido ? JSON.parse(contenido) : [];
}


// ======================================================
// FUNCIÓN: guardarUsuarios
// Guarda los usuarios registrados
// ======================================================

function guardarUsuarios(usuarios) {

    fs.writeFileSync(
        archivoUsuarios,
        JSON.stringify(usuarios, null, 2)
    );
}


// ======================================================
// ENDPOINT DE REGISTRO
// Método: POST
// Ruta: /api/registro
// ======================================================

app.post("/api/registro", async (req, res) => {

    // Obtener usuario y contraseña enviados
    const { usuario, password } = req.body;

    // Validar campos obligatorios
    if (!usuario || !password) {

        return res.status(400).json({
            error: "El usuario y la contraseña son obligatorios"
        });
    }

    // Obtener usuarios existentes
    const usuarios = obtenerUsuarios();

    // Comprobar si el usuario ya existe
    const usuarioExistente = usuarios.find(
        item =>
            item.usuario.toLowerCase() ===
            usuario.toLowerCase()
    );

    if (usuarioExistente) {

        return res.status(409).json({
            error: "El usuario ya se encuentra registrado"
        });
    }

    // Encriptar la contraseña antes de guardarla
    const passwordEncriptada = await bcrypt.hash(
        password,
        10
    );

    // Crear el nuevo usuario
    usuarios.push({
        usuario: usuario,
        password: passwordEncriptada
    });

    // Guardar el usuario
    guardarUsuarios(usuarios);

    // Respuesta de registro exitoso
    return res.status(201).json({
        mensaje: "Usuario registrado correctamente"
    });
});


// ======================================================
// ENDPOINT DE INICIO DE SESIÓN
// Método: POST
// Ruta: /api/login
// ======================================================

app.post("/api/login", async (req, res) => {

    // Obtener los datos enviados
    const { usuario, password } = req.body;

    // Validar campos obligatorios
    if (!usuario || !password) {

        return res.status(400).json({
            error: "El usuario y la contraseña son obligatorios"
        });
    }

    // Obtener usuarios registrados
    const usuarios = obtenerUsuarios();

    // Buscar el usuario
    const usuarioEncontrado = usuarios.find(
        item =>
            item.usuario.toLowerCase() ===
            usuario.toLowerCase()
    );

    // Si el usuario no existe
    if (!usuarioEncontrado) {

        return res.status(401).json({
            error: "Error en la autenticación"
        });
    }

    // Comparar la contraseña ingresada
    // con la contraseña almacenada
    const passwordCorrecta = await bcrypt.compare(
        password,
        usuarioEncontrado.password
    );

    // Verificar si la contraseña es correcta
    if (!passwordCorrecta) {

        return res.status(401).json({
            error: "Error en la autenticación"
        });
    }

    // Respuesta de autenticación exitosa
    return res.status(200).json({
        mensaje: "Autenticación satisfactoria"
    });
});


// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

app.listen(PORT, () => {

    console.log(
        `API GamaSistem ejecutándose en http://localhost:${PORT}`
    );
});