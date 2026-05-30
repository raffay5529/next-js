import mongoose ,{Schema,Document} from "mongoose";

export interface IBoard extends Document{
  name:string;
  userId:string;
  columns:mongoose.Types.ObjectId[];
  updatedAt:Date;
  createdAt:Date;
}

const BoardSchema=new Schema<IBoard>({
  name:{type:String,required:true},
  userId:{type:String,required:true,
    index:true},
  columns:[{type:Schema.Types.ObjectId,ref:"MyColumn"}],
},{
  timestamps:true,
});

export default mongoose.models.Board || mongoose.model<IBoard>("Board",BoardSchema);
