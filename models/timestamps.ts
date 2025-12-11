import { Schema, model, models } from "mongoose";

const timestamps = new Schema(
  {
    id_unidad:{
        type: Schema.Types.ObjectId,
        ref: 'unidades',
        required: true,
        trim: true,
    },
    id_ruta:{
        type: Schema.Types.ObjectId,
        ref: 'rutas',
        required: true,
        trim: true,
    },
    id_fiscal:{
        type: Schema.Types.ObjectId,
        ref: 'fiscales',
        required: true,
        trim: true,
    },
    timestamp_telefono:{
        type: String,
        required: true,
        trim: true,
    },
    timestamp_salida:{
        type: String,
        default: null,
        trim: true,
    },
    counter:{
        type: Number,
        default: null,
        trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default models.timestamps || model("timestamps", timestamps);