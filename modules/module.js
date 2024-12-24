import bcrypt from "bcryptjs";
import pool from "../config/config.js";

export const verificacionCredencial = async (email, password) => {
  const values = [email];
  const consulta = "SELECT * FROM USUARIOS WHERE email = $1";
  const {
    rows: [usuario],
    rowCount,
  } = await pool.query(consulta, values);
  const { password: passwordEncriptada } = usuario;
  const ClaveCorrecta = bcrypt.compareSync(password, passwordEncriptada); //se esta comparando las claves y se le otorga un valor booleano
  if (!ClaveCorrecta || !rowCount)
    //se compara si la clave es correcta o no o si hay rowCount con el email
    throw { code: 401, message: "Email y/o Contraseña incorrecta" };
};

export const registrarUsuario = async (usuario) => {
  let { email, password, rol, lenguage } = usuario;
  try {
    const passwordEncriptada = bcrypt.hashSync(password);
    const values = [email, passwordEncriptada, rol, lenguage];
    const consulta =
      "INSERT INTO USUARIOS (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)";
    await pool.query(consulta, values);
  } catch (error) {
    console.log("error al registrar usuario", error);
    throw {
      code: 500,
      message: "Error al registrar el usuario. Inténtalo nuevamente.",
    };
  }
};
