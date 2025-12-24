import mongoose from "mongoose";

// ============================
// SUBDOCUMENTO: APLICACIÓN
// ============================
const AplicacionSchema = new mongoose.Schema(
  {
    aplicacionID: { type: String, required: true },
    aplicacionNombre: { type: String, required: true },
    aplicacionActiva: { type: Boolean, default: true },
    aplicacionFechaExpiracion: { type: Date, default: null }
  },
  { _id: false }
);

// ============================
// SUBDOCUMENTO: CATEGORÍA
// ============================
const CategoriaSchema = new mongoose.Schema(
  {
    categoriaID: { type: String, required: true },
    categoriaNombre: { type: String, required: true },
    aplicaciones: { type: [AplicacionSchema], default: [] }
  },
  { _id: false }
);

// ============================
// SUBDOCUMENTO: LICENCIA
// ============================
const LicenciaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["mensual", "anual", "perpetua"],
      required: true
    },
    expiracion: { type: Date, default: null }
  },
  { _id: false }
);

// ============================
// SCHEMA PRINCIPAL
// ============================
const InstitucionSchema = new mongoose.Schema(
  {
    institucionNombre: { type: String, required: true },
    institucionLicencia: { type: String, required: true, unique: true },

    categorias: { type: [CategoriaSchema], default: [] },

    licencia: { type: LicenciaSchema, required: true },

    version: { type: Number, default: 1 }
  },
  {
    timestamps: {
      createdAt: "creadoEl",
      updatedAt: "actualizadoEl"
    }
  }
);

export default mongoose.model(
  "Institucion",
  InstitucionSchema,
  "instituciones"
);