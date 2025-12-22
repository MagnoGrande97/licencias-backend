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
 * POST /licencias/validar
 * Body:
 * {
 *   "entidadId": "UTP",
 *   "licencia": "UTP-2025-AAA"
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});