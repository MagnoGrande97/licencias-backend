import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Institucion from "./models/Institucion.js";

dotenv.config();

const app = express();
app.use(express.json());

// ============================
// CONEXIÓN MONGODB
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));

// ============================
// CREAR INSTITUCIÓN
// POST /instituciones
// ============================
app.post("/instituciones", async (req, res) => {
  try {
    const {
      institucionNombre,
      institucionLicencia,
      tipoLicencia,
      expiracion
    } = req.body;

    if (!institucionNombre || !institucionLicencia || !tipoLicencia) {
      return res.status(400).json({
        ok: false,
        msg: "Datos incompletos"
      });
    }

    const existe = await Institucion.findOne({ institucionLicencia });

    if (existe) {
      return res.json({
        ok: true,
        msg: "La licencia ya existe",
        institucionID: existe._id.toString()
      });
    }

    const nueva = new Institucion({
      institucionNombre,
      institucionLicencia,
      categorias: [],
      licencia: {
        tipo: tipoLicencia,
        expiracion: expiracion ?? null
      },
      permisos: [],
      version: 1
    });

    await nueva.save();

    res.json({
      ok: true,
      institucionID: nueva._id.toString(),
      institucionNombre: nueva.institucionNombre,
      institucionLicencia: nueva.institucionLicencia
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      msg: "Error interno"
    });
  }
});

// ============================
// VALIDAR LICENCIA
// POST /instituciones/validar-licencia
// ============================
app.post("/instituciones/validar-licencia", async (req, res) => {
  try {
    const { institucionLicencia } = req.body;

    if (!institucionLicencia) {
      return res.status(400).json({
        valida: false,
        msg: "institucionLicencia requerida"
      });
    }

    const institucion = await Institucion.findOne({ institucionLicencia });

    if (!institucion) {
      return res.json({ valida: false });
    }

    if (
      institucion.licencia.expiracion &&
      new Date(institucion.licencia.expiracion) < new Date()
    ) {
      return res.json({
        valida: false,
        msg: "Licencia expirada"
      });
    }

    res.json({
      valida: true,
      institucionID: institucion._id.toString(),
      institucionNombre: institucion.institucionNombre,
      institucionLicencia: institucion.institucionLicencia,
      licencia: institucion.licencia,
      categorias: institucion.categorias,
      version: institucion.version
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      valida: false,
      msg: "Error interno"
    });
  }
});

// ============================
// LISTAR INSTITUCIONES
// GET /instituciones
// ============================
app.get("/instituciones", async (req, res) => {
  try {
    const instituciones = await Institucion.find({}, {
      institucionNombre: 1,
      institucionLicencia: 1,
      licencia: 1,
      version: 1
    });

    res.json(instituciones);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      msg: "Error interno"
    });
  }
});

app.post("/instituciones/obtener-licencia", async (req, res) => {
  const { institucionLicencia } = req.body;

  const inst = await Institucion.findOne({ institucionLicencia });
  if (!inst) return res.json({ valida: false });

  // Expiración global
  if (
    inst.licencia?.expiracion &&
    new Date(inst.licencia.expiracion) < new Date()
  ) {
    return res.json({ valida: false, msg: "Licencia expirada" });
  }

  res.json({
    valida: true,
    institucionID: inst._id.toString(),
    institucionNombre: inst.institucionNombre,
    categorias: inst.categorias,
    licencia: inst.licencia,
    version: inst.version
  });
});

// ============================
// DEBUG DB (opcional)
// ============================
app.get("/debug/db", (req, res) => {
  res.json({
    db: mongoose.connection.name
  });
});

// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});