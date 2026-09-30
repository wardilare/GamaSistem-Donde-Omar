// ======================================================
// API GamaSistem - Donde Omar
// Servicios web para el proyecto
// Evidencia GA7-220501096-AA5-EV03
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


// ======================================================
// RUTAS DE LOS ARCHIVOS JSON
// ======================================================

const archivoUsuarios = path.join(
    __dirname,
    "data",
    "users.json"
);

const archivoClientes = path.join(
    __dirname,
    "data",
    "clientes.json"
);

const archivoReparaciones = path.join(
    __dirname,
    "data",
    "reparaciones.json"
);

const archivoVehiculos = path.join(
    __dirname,
    "data",
    "vehiculos.json"
);


// ======================================================
// FUNCIONES GENERALES PARA LEER Y GUARDAR INFORMACIÓN
// ======================================================

// Leer información de un archivo JSON
function leerDatos(archivo) {

    if (!fs.existsSync(archivo)) {
        return [];
    }

    const contenido = fs.readFileSync(
        archivo,
        "utf8"
    );

    return contenido ? JSON.parse(contenido) : [];
}


// Guardar información en un archivo JSON
function guardarDatos(archivo, datos) {

    fs.writeFileSync(
        archivo,
        JSON.stringify(datos, null, 2)
    );
}


// ======================================================
// SERVICIO DE REGISTRO DE USUARIOS
// Método: POST
// Ruta: /api/registro
// ======================================================

app.post("/api/registro", async (req, res) => {

    const { usuario, password } = req.body;

    // Validar campos obligatorios
    if (!usuario || !password) {

        return res.status(400).json({
            error: "El usuario y la contraseña son obligatorios"
        });
    }

    const usuarios = leerDatos(archivoUsuarios);

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

    // Encriptar la contraseña
    const passwordEncriptada = await bcrypt.hash(
        password,
        10
    );

    usuarios.push({
        usuario: usuario,
        password: passwordEncriptada
    });

    guardarDatos(
        archivoUsuarios,
        usuarios
    );

    return res.status(201).json({
        mensaje: "Usuario registrado correctamente"
    });
});


// ======================================================
// SERVICIO DE INICIO DE SESIÓN
// Método: POST
// Ruta: /api/login
// ======================================================

app.post("/api/login", async (req, res) => {

    const { usuario, password } = req.body;

    // Validar campos obligatorios
    if (!usuario || !password) {

        return res.status(400).json({
            error: "El usuario y la contraseña son obligatorios"
        });
    }

    const usuarios = leerDatos(archivoUsuarios);

    const usuarioEncontrado = usuarios.find(
        item =>
            item.usuario.toLowerCase() ===
            usuario.toLowerCase()
    );

    if (!usuarioEncontrado) {

        return res.status(401).json({
            error: "Error en la autenticación"
        });
    }

    // Comparar contraseña ingresada
    const passwordCorrecta = await bcrypt.compare(
        password,
        usuarioEncontrado.password
    );

    if (!passwordCorrecta) {

        return res.status(401).json({
            error: "Error en la autenticación"
        });
    }

    return res.status(200).json({
        mensaje: "Autenticación satisfactoria"
    });
});


// ======================================================
// SERVICIO DE CLIENTES
// ======================================================

// Obtener todos los clientes
// Método: GET
// Ruta: /api/clientes

app.get("/api/clientes", (req, res) => {

    const clientes = leerDatos(
        archivoClientes
    );

    return res.status(200).json(clientes);
});


// Registrar un cliente
// Método: POST
// Ruta: /api/clientes

app.post("/api/clientes", (req, res) => {

    const {
        nombre,
        documento,
        telefono,
        correo
    } = req.body;

    // Validar información obligatoria
    if (!nombre || !documento) {

        return res.status(400).json({
            error: "El nombre y documento son obligatorios"
        });
    }

    const clientes = leerDatos(
        archivoClientes
    );

    // Verificar si el documento ya existe
    const clienteExistente = clientes.find(
        item =>
            item.documento === documento
    );

    if (clienteExistente) {

        return res.status(409).json({
            error: "El cliente ya se encuentra registrado"
        });
    }

    const nuevoCliente = {
        id: clientes.length + 1,
        nombre,
        documento,
        telefono: telefono || "",
        correo: correo || ""
    };

    clientes.push(nuevoCliente);

    guardarDatos(
        archivoClientes,
        clientes
    );

    return res.status(201).json({
        mensaje: "Cliente registrado correctamente",
        cliente: nuevoCliente
    });
});


// ======================================================
// SERVICIO DE REPARACIONES
// ======================================================

// Obtener reparaciones
// Método: GET
// Ruta: /api/reparaciones

app.get("/api/reparaciones", (req, res) => {

    const reparaciones = leerDatos(
        archivoReparaciones
    );

    return res.status(200).json(
        reparaciones
    );
});


// Registrar reparación
// Método: POST
// Ruta: /api/reparaciones

app.post("/api/reparaciones", (req, res) => {

    const {
        cliente,
        equipo,
        problema,
        estado
    } = req.body;

    // Validar campos obligatorios
    if (!cliente || !equipo || !problema) {

        return res.status(400).json({
            error: "Cliente, equipo y problema son obligatorios"
        });
    }

    const reparaciones = leerDatos(
        archivoReparaciones
    );

    const nuevaReparacion = {
        id: reparaciones.length + 1,
        cliente,
        equipo,
        problema,
        estado: estado || "Recibido"
    };

    reparaciones.push(
        nuevaReparacion
    );

    guardarDatos(
        archivoReparaciones,
        reparaciones
    );

    return res.status(201).json({
        mensaje: "Reparación registrada correctamente",
        reparacion: nuevaReparacion
    });
});


// Actualizar estado de reparación
// Método: PUT
// Ruta: /api/reparaciones/:id

app.put("/api/reparaciones/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const { estado } = req.body;

    if (!estado) {

        return res.status(400).json({
            error: "El estado es obligatorio"
        });
    }

    const reparaciones = leerDatos(
        archivoReparaciones
    );

    const reparacion = reparaciones.find(
        item => item.id === id
    );

    if (!reparacion) {

        return res.status(404).json({
            error: "Reparación no encontrada"
        });
    }

    reparacion.estado = estado;

    guardarDatos(
        archivoReparaciones,
        reparaciones
    );

    return res.status(200).json({
        mensaje: "Estado de reparación actualizado",
        reparacion
    });
});


// ======================================================
// SERVICIO DE VEHÍCULOS
// ======================================================

// Obtener vehículos
// Método: GET
// Ruta: /api/vehiculos

app.get("/api/vehiculos", (req, res) => {

    const vehiculos = leerDatos(
        archivoVehiculos
    );

    return res.status(200).json(
        vehiculos
    );
});


// Registrar vehículo
// Método: POST
// Ruta: /api/vehiculos

app.post("/api/vehiculos", (req, res) => {

    const {
        placa,
        marca,
        modelo,
        propietario
    } = req.body;

    // Validar campos obligatorios
    if (!placa || !marca || !modelo) {

        return res.status(400).json({
            error: "Placa, marca y modelo son obligatorios"
        });
    }

    const vehiculos = leerDatos(
        archivoVehiculos
    );

    const vehiculoExistente = vehiculos.find(
        item =>
            item.placa.toLowerCase() ===
            placa.toLowerCase()
    );

    if (vehiculoExistente) {

        return res.status(409).json({
            error: "El vehículo ya se encuentra registrado"
        });
    }

    const nuevoVehiculo = {
        id: vehiculos.length + 1,
        placa,
        marca,
        modelo,
        propietario: propietario || ""
    };

    vehiculos.push(nuevoVehiculo);

    guardarDatos(
        archivoVehiculos,
        vehiculos
    );

    return res.status(201).json({
        mensaje: "Vehículo registrado correctamente",
        vehiculo: nuevoVehiculo
    });
});


// Actualizar vehículo
// Método: PUT
// Ruta: /api/vehiculos/:id

app.put("/api/vehiculos/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const {
        marca,
        modelo,
        propietario
    } = req.body;

    const vehiculos = leerDatos(
        archivoVehiculos
    );

    const vehiculo = vehiculos.find(
        item => item.id === id
    );

    if (!vehiculo) {

        return res.status(404).json({
            error: "Vehículo no encontrado"
        });
    }

    if (marca) {
        vehiculo.marca = marca;
    }

    if (modelo) {
        vehiculo.modelo = modelo;
    }

    if (propietario) {
        vehiculo.propietario = propietario;
    }

    guardarDatos(
        archivoVehiculos,
        vehiculos
    );

    return res.status(200).json({
        mensaje: "Vehículo actualizado correctamente",
        vehiculo
    });
});


// Eliminar vehículo
// Método: DELETE
// Ruta: /api/vehiculos/:id

app.delete("/api/vehiculos/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const vehiculos = leerDatos(
        archivoVehiculos
    );

    const indice = vehiculos.findIndex(
        item => item.id === id
    );

    if (indice === -1) {

        return res.status(404).json({
            error: "Vehículo no encontrado"
        });
    }

    const vehiculoEliminado =
        vehiculos.splice(indice, 1)[0];

    guardarDatos(
        archivoVehiculos,
        vehiculos
    );

    return res.status(200).json({
        mensaje: "Vehículo eliminado correctamente",
        vehiculo: vehiculoEliminado
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