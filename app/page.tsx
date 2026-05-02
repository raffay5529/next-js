import {getSesssion} from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import Board from "@/lib/models/board";
import KanbanBoard from "@/components/kanban-board";

export default async function Home() {
  const session=await getSesssion();


  await connectDB();

  const board=await Board.findOne({userId:session?.user?.id,name:"Job Hunt"}).populate("columns");



  return (
<div className="min-h-screen bg-black">
  <main className="max-w-5xl w-full mx-auto bg-white">
    <div>
      <h1 className="text-3xl font-bold text-center py-10">Welcome to MedGenesis Ai Health Infrastructure</h1>
      <p className="text-center font-bold">{session?.user?.name}</p>
      <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session?.user.id??"null session"}/>
    </div>
  </main>
</div>
  );
}
