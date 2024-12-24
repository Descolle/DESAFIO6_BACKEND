import express from "express";
import { registrarUsuario, verificacionCredencial } from "../modules/module.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar la existencia de credenciales
const Revision = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son obligatorios" });
  }
  next();
};

// Middleware para validar el token recibido
const verificarToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token no proporcionado o inválido" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    console.error("Error al verificar el token:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

router.post("/usuarios", async (req, res) => {
  try {
    const usuario = req.body;
    await registrarUsuario(usuario);
    res.send("Usuario creado con éxito");
  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Usuario ya existe" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

//reciba las credenciales de un usuario y genera TOKEN
router.post("/login", Revision, async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificacionCredencial(email, password);
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "2 days" });
    res.send({ token });
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error);
  }
});

// Obtiene información de un usuario
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const { email, rol, lenguage } = req.user;
    console.log(`Token válido para el usuario: ${email}`);

    res.status(200).json({ email });
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
