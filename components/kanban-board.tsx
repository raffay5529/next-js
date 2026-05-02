"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal,Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  board:any;
  userId:string;
}
export default function KanbanBoard({board,userId}:KanbanBoardProps) {

  const boardColors:string[]=["bg-red-500","bg-green-500","bg-blue-500","bg-yellow-500","bg-purple-500"];
  
  

  console.log("KanbanBoard Props - Board:", board);
  return(
    <div>
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <div className="flex gap-4 flex-col">
        
      {
        board?.columns.map((col,index:number)=>{
          return (
            <div className={`${boardColors[index]} `} key={index}>
                <DropdownMenu>
  <DropdownMenuTrigger asChild className="bg-yellow-200 rounded">
    <Button className="bg-red-500 h-4 w-3" variant="ghost" ><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><Trash2/>Delete Column</DropdownMenuItem>
    
  </DropdownMenuContent>
 
</DropdownMenu>
              {col.name}
              
            </div>
          )
        })
      }
   
      </div>
    </div>
  )
}