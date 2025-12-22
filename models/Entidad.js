import mongoose from "mongoose";

const ModuloSchema = new mongoose.Schema({
  idModulo: String,
  addressableKey: String
});

const EntidadSchema = new mongoose.Schema({
  entidadId: {
    type: String,
    required: true,
    unique: true
  },

  codigoDeActivacion: {
    type: String,
    required: true,
    unique: true
  },

  modulos: [ModuloSchema]
});

export default mongoose.model("Entidad", EntidadSchema);
