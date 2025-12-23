import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Institucion from "./models/Institucion.js";

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));

/**
 * ============================
 * VALIDAR LICENCIA
 * POST /licencias/validar
 * Body:
 * {
 *   "licencia": "A-C0C96826"
 * }
 * ============================
 */
app.post("/licencias/validar", async (req, res) => {
  try {
    const { licencia } = req.body;

    if (!licencia)
      return res.status(400).json({ valida: false, msg: "Licencia requerida" });

    const institucion = await Institucion.findOne({
      institucionLicencia: licencia
    });

    if (!institucion)
      return res.json({ valida: false });

    // Validar expiración
    if (
      institucion.expiracion &&
      new Date(institucion.expiracion) < new Date()
    ) {
      return res.json({ valida: false, msg: "Licencia expirada" });
    }

    return res.json({
      valida: true,
      institucionID: institucion._id.toString(),
      institucionNombre: institucion.institucionNombre,
      institucionLicencia: institucion.institucionLicencia,
      permisos: institucion.permisos,
      expiracion: institucion.expiracion,
      version: institucion.version
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ valida: false, msg: "Error interno" });
  }
});

/**
 * ============================
 * CREAR INSTITUCIÓN / LICENCIA
 * POST /licencias/crear
 * Body:
 * {
 *   "institucionNombre": "Draeger Peru",
 *   "institucionLicencia": "A-C0C96826",
 *   "expiracion": "2026-12-23T15:34:05.474Z"
 * }
 * ============================
 */
app.post("/licencias/crear", async (req, res) => {
  try {
    const { institucionNombre, institucionLicencia, expiracion } = req.body;

    if (!institucionNombre || !institucionLicencia)
      return res
        .status(400)
        .json({ ok: false, msg: "Faltan datos" });

    const existe = await Institucion.findOne({
      institucionLicencia
    });

    if (existe)
      return res.json({ ok: true, msg: "La licencia ya existe" });

    const nueva = new Institucion({
      institucionNombre,
      institucionLicencia,
      expiracion: expiracion ?? null,
      permisos: [],
      version: 1
    });

    await nueva.save();

    return res.json({
      ok: true,
      institucionID: nueva._id.toString(),
      institucionNombre: nueva.institucionNombre,
      institucionLicencia: nueva.institucionLicencia
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});