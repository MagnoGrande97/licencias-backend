import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Entidad from "./models/Entidad.js";

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

/**
 * Endpoint para validar licencias
 * POST /licencias/validar
 * Body:
 * {
 *   "entidadId": "UCV",
 *   "licencia": "M-77C84D81"
 * }
 */
app.post("/licencias/validar", async (req, res) => {
  const { entidadId, licencia } = req.body;

  if (!entidadId || !licencia)
    return res.status(400).json({ valida: false });

  const entidad = await Entidad.findOne({
    entidadId,
    codigoDeActivacion: licencia
  });

  if (!entidad)
    return res.json({ valida: false });

  res.json({
    valida: true,
    entidadId: entidad.entidadId,
    modulos: entidad.modulos
  });
});

/**
 * Endpoint para crear licencias automáticamente
 * POST /licencias/crear
 * Body:
 * {
 *   "entidadId": "UCV",
 *   "licencia": "M-77C84D81"
 * }
 */
app.post("/licencias/crear", async (req, res) => {
  const { entidadId, licencia } = req.body;

  if (!entidadId || !licencia)
    return res.status(400).json({ ok: false, msg: "Faltan datos" });

  try {
    // Verifica si ya existe
    const existe = await Entidad.findOne({ entidadId });
    if (existe) return res.json({ ok: true, msg: "Entidad ya existe" });

    const nuevaEntidad = new Entidad({
      entidadId,
      codigoDeActivacion: licencia,
      modulos: [] // Aquí puedes añadir módulos predeterminados si quieres
    });

    await nuevaEntidad.save();
    res.json({ ok: true, msg: "Entidad creada correctamente" });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});