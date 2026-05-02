import { betterAuth } from "better-auth"; 
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import type { User } from "better-auth";
import { initializeUserBoard } from "../init-user-board";


const client= new MongoClient(process.env.MONGODB_URI!);

const db=client.db();

export const auth=betterAuth({
  database:mongodbAdapter(db,{
    client,

  }),
  emailAndPassword:{
    enabled:true,
  },
  databaseHooks:{
    user:{
      create:{
        after:async (user)=>{
          if(user.id){
            await initializeUserBoard(user.id);
          }
        
      }
    }
  }
}
});

export async function getSesssion(){
  const result=await auth.api.getSession({
    headers:await headers(),
  });
  return result;
};


