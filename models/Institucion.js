import mongoose from "mongoose";

const PermisoSchema = new mongoose.Schema({
  idModulo: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

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
    timestamps: true // creadoEl / actualizadoEl
  }
);

export default mongoose.model("Institucion", InstitucionSchema);