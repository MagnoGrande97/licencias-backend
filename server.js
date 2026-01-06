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
      return res.status(400).json({ ok: false, msg: "Datos incompletos" });
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
    res.status(500).json({ ok: false, msg: "Error interno" });
  }
});

// ============================
// VALIDAR LICENCIA
// ============================
app.post("/instituciones/validar-licencia", async (req, res) => {
  try {
    const { institucionLicencia } = req.body;
    if (!institucionLicencia)
      return res.status(400).json({ valida: false });

    const inst = await Institucion.findOne({ institucionLicencia });
    if (!inst) return res.json({ valida: false });

    if (
      inst.licencia.expiracion &&
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ valida: false });
  }
});

// ============================
// CREAR CATEGORÍA (IDEMPOTENTE)
// POST /instituciones/:id/categorias
// ============================
app.post("/instituciones/:id/categorias", async (req, res) => {
  try {
    const { categoriaID, categoriaNombre } = req.body;
    if (!categoriaID || !categoriaNombre)
      return res.status(400).json({ ok: false });

    const inst = await Institucion.findById(req.params.id);
    if (!inst) return res.status(404).json({ ok: false });

    const existe = inst.categorias.find(
      c => c.categoriaID === categoriaID
    );

    if (existe) {
      return res.json({
        ok: true,
        msg: "Categoría ya existe",
        version: inst.version
      });
    }

    inst.categorias.push({
      categoriaID,
      categoriaNombre,
      aplicaciones: []
    });

    inst.version++;
    await inst.save();

    res.json({ ok: true, version: inst.version });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// ============================
// CREAR / ACTUALIZAR APP
// POST /instituciones/:id/categorias/:categoriaID/apps
// ============================
app.post("/instituciones/:id/categorias/:categoriaID/apps", async (req, res) => {
  try {
    const {
      aplicacionID,
      aplicacionNombre,
      aplicacionActiva,
      aplicacionFechaExpiracion,
      addressableKey,
      categoriaId,
      requiereDescarga
    } = req.body;

    const inst = await Institucion.findById(req.params.id);
    if (!inst) return res.status(404).json({ ok: false });

    const categoria = inst.categorias.find(
      c => c.categoriaID === req.params.categoriaID
    );
    if (!categoria)
      return res.status(404).json({ ok: false, msg: "Categoría no existe" });

    const app = categoria.aplicaciones.find(
      a => a.aplicacionID === aplicacionID
    );

    if (app) {
      app.aplicacionNombre = aplicacionNombre;
      app.aplicacionActiva = aplicacionActiva;
      app.aplicacionFechaExpiracion = aplicacionFechaExpiracion ?? null;
      app.addressableKey = addressableKey ?? app.addressableKey;
      app.categoriaId = categoriaId ?? app.categoriaId;
      app.requiereDescarga = requiereDescarga ?? app.requiereDescarga;
    } else {
      categoria.aplicaciones.push({
        aplicacionID,
        aplicacionNombre,
        aplicacionActiva,
        aplicacionFechaExpiracion,
        addressableKey,
        categoriaId,
        requiereDescarga
      });
    }

    inst.version++;
    await inst.save();

    res.json({ ok: true, version: inst.version });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});