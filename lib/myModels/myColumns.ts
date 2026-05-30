import mongoose, { Schema, Document } from "mongoose";
import { MyIColumn } from "./mymodels.types";



const MyColumnSchema = new Schema<MyIColumn & Document>(
  {
    name:{
      type:String,
      required:true

    },

  },
  {
    timestamps: true,   // handles createdAt & updatedAt automatically
  }
);

export default mongoose.models.MyColumn || mongoose.model<MyIColumn>("MyColumn", MyColumnSchema);