import { Schema, model, models } from "mongoose";

const fiscales = new Schema(
  {
    numero: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    ubicacion: {   
        type: String,
        required: true,
        trim: true,
    },
    username:{
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        trim: true,
    },
    sethora:{
        type: Boolean,
        default: false,
    },
    setruta:{
        type: Boolean,
        default: false,
    },
    setdelete:{
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
  }
);

export default models.fiscales || model("fiscales", fiscales);