import mongoose from "mongoose";

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
    expiracion: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

// ============================
// SUBDOCUMENTO: PERMISO
// ============================
const PermisoSchema = new mongoose.Schema(
  {
    idModulo: { type: String, required: true },
    enabled: { type: Boolean, default: true }
  },
  { _id: false }
);

// ============================
// SCHEMA PRINCIPAL
// ============================
const InstitucionSchema = new mongoose.Schema(
  {
    institucionNombre: {
      type: String,
      required: true
    },

    institucionLicencia: {
      type: String,
      required: true,
      unique: true
    },

    categorias: {
      type: Array,
      default: []
    },

    licencia: {
      type: LicenciaSchema,
      required: true
    },

    permisos: {
      type: [PermisoSchema],
      default: []
    },

    version: {
      type: Number,
      default: 1
    }
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