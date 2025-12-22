import mongoose from "mongoose";

const ModuloSchema = new mongoose.Schema({
  idModulo: String,       // "Lobby", "UCI", "Quirofano"
  addressableKey: String // key o label en Unity
});

const EntidadSchema = new mongoose.Schema({
  entidadId: {
    type: String,         // "UTP", "UPC", etc.
    required: true,
    unique: true
  },

  codigoDeActivacion: {
    type: String,         // licencia
    required: true,
    unique: true
  },

  modulos: [ModuloSchema]
});

export default mongoose.model("Entidad", EntidadSchema);