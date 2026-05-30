import { getBoardsByUser } from "@/lib/actions/my-kanban-actions"
import BoardsPage from "./Boardspage"
import { getSession } from "@/lib/auth/auth"
import { Suspense } from "react"

async function BoardContent() {
  const session = await getSession();
  console.log("Session data in BoardContent:", session);
  const result = await getBoardsByUser(session?.user.id ?? "");
  const boards = result.success ? result.data : [];

  return <BoardsPage user={session} boards={boards} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BoardContent />
    </Suspense>
  );
}