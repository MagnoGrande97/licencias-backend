import mongoose from "mongoose";

// ============================
// SUBDOCUMENTO: PERMISO
// ============================
const PermisoSchema = new mongoose.Schema(
  {
    idModulo: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
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

    permisos: {
      type: [PermisoSchema],
      default: []
    },

    expiracion: {
      type: Date,
      default: null
    },

    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// ============================
// MÉTODOS ESTÁTICOS
// ============================
InstitucionSchema.statics.listar = function () {
  return this.find(
    {},
    {
      institucionNombre: 1,
      institucionLicencia: 1,
      expiracion: 1,
      version: 1,
      createdAt: 1
    }
  ).sort({ createdAt: -1 });
};

// ============================
// EXPORT
// ============================
export default mongoose.model(
  "Institucion",
  InstitucionSchema,
  "instituciones"
);
