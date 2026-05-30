import mongoose, { Schema, Document } from "mongoose";
import { MyICard } from "./mymodels.types";

const CardSchema = new Schema<MyICard & Document>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
    assignee: {
      type: String,
      default:"",
    },
    initials: {
      type: String,
      default:"",
    },
    column: {
      type: Schema.Types.ObjectId,
      ref: "MyColumn",
      required: true,
    },
    order: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MyCard || mongoose.model<MyICard & Document>("MyCard", CardSchema);