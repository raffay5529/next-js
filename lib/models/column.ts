import mongoose, { Schema, Document } from "mongoose";

export interface IColumn extends Document {
  name: string;
  boardId: mongoose.Types.ObjectId;
  order: number;
  jobApplications: mongoose.Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
  {
    name: { type: String, required: true },
    boardId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Board",      // ref was outside the object before
    },
    order: { type: Number, required: true,default: 0 },
    jobApplications: [{ type: Schema.Types.ObjectId, ref: "JobApplication" }], // was "columns" before
  },
  {
    timestamps: true,   // handles createdAt & updatedAt automatically
  }
);

export default mongoose.models.Column || mongoose.model<IColumn>("Column", ColumnSchema);