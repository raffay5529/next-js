import mongoose from "mongoose";

export interface KanBan {
  _id?: string;
  title: string;
  description: string;
  tag: string;
  assignee: string;
  initials?: string;
  column: string;
 
};

export interface MyICard {
  _id?: string;
  title: string;
  description: string;
  tag: string;
  assignee: string;
  initials: string;
  column: mongoose.Types.ObjectId;
   order?:number;
};

export interface MyIColumn{
  name:string
}