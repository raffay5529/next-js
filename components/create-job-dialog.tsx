"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createJobApplication } from "@/lib/actions/job-applications"

interface CreateJobApplicationDialogProps {
  columnId: string
  boardId: string
}

const INITIAL_FORM_DATA={
    company:"",
    position:"",
    location:"",
    notes:"",
    salary:"",
    jobUrl:"",
    tags:"",
    description:""
  }

export default function CreateJobApplicationDialog({ columnId, boardId }: CreateJobApplicationDialogProps) {

  const[open,setOpen]=useState<boolean>(false);
  const[formData,setFormData]=useState(INITIAL_FORM_DATA)

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();

    try{
     const result = await createJobApplication({
  ...formData,
  columnId,
  boardId,
  tags: formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
});
if(!result.error){
  setFormData(INITIAL_FORM_DATA)
  setOpen(false)

}else{
  console.error("failed to create job",result.error)
}
    }catch(err){
      console.error(err)
    }
  }




  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
          <DialogDescription>Track a new job application</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" className="w-full" required value={formData.company} onChange={(e)=>{
                  setFormData({...formData,company:e.target.value})
                }} />
              </div>
              <div className="flex-1">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" className="w-full" required value={formData.position} onChange={(e)=>{
                  setFormData({...formData,position:e.target.value})
                }}  />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" className="w-full"  value={formData.location} onChange={(e)=>{
                  setFormData({...formData,location:e.target.value})
                }}/>
              </div>
              <div className="flex-1">
                <Label htmlFor="salary">Salary</Label>
                <Input id="salary" className="w-full" value={formData.salary} onChange={(e)=>{
                  setFormData({...formData,salary:e.target.value})
                }}/>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="jobUrl">Job URL</Label>
                <Input id="jobUrl" className="w-full" value={formData.jobUrl} onChange={(e)=>{
                  setFormData({...formData,jobUrl:e.target.value})
                }} />
              </div>
              <div className="flex-1">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" className="w-full" value={formData.tags} onChange={(e)=>{
                  setFormData({...formData,tags:e.target.value})
                }} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="description">Description</Label>
                <Input id="description" className="w-full" value={formData.description} onChange={(e)=>{
                  setFormData({...formData,description:e.target.value})
                }} />
              </div>
              <div className="flex-1">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" className="w-full" value={formData.notes} onChange={(e)=>{
                  setFormData({...formData,notes:e.target.value})
                }}/>
              </div>
            </div>

           

          </div>

          <DialogFooter>
            <Button onClick={()=>{
              setOpen(false)
            }} type="button" variant="outline">Cancel</Button>
            <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}