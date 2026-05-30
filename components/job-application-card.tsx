import { JobApplication,Column } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button";
import { DropdownMenuTrigger } from "./ui/dropdown-menu";

interface JobApplicationCardProps{
  job:JobApplication;
  columns:Column[]
}

export default function JobApplicationCard({job,columns}:JobApplicationCardProps){

  console.log(columns,job)
return (
  <>
  <Card>
    <CardContent>
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">{job.position}</h3>
          <p className="text-muted-foreground text-xs mb-2">{job.company}</p>
          {job.description && (
            <p className="text-muted-foreground text-xs mb-2">{job.description}</p>
          ) }
          {job.tags && job.tags.length>0 &&(
            <div>{job.tags.map((tag,key)=>(
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full " key={key}>{tag}</span>
            ))}</div>
          )}

          {job.jobUrl && (
            <a className="mt-2 inline-block" target="_blank" href={job.jobUrl} onClick={(e)=> e.stopPropagation()}>
              <ExternalLink className="h-4 w-4"/>
            </a>
          )}
        </div>
       <div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
          
                <MoreVertical/>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2/>
                Edit
              </DropdownMenuItem>
              {columns.length > 1 && (
  <>
    {columns
      .filter((c) => c._id !== job.columnId)
      .map((column,key) => (
        <DropdownMenuItem key={key}>
          Move to {column.name}
        </DropdownMenuItem>
      ))}
  </>
)}

  <DropdownMenuItem>
    <Trash2/>
    Delete
  </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
       </div>
      </div>
    </CardContent>
  </Card>
  </>
)
}