"use client"

import { Button } from "@/components/ui/button";
import Test from "./test";
import { useSession } from "@/lib/auth/auth-client";
import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export default function Page() {
  const {data:session,isPending}=useSession();
  const router=useRouter();


if(isPending){

  return <div>Loading...</div>
}

  return (
    <div className="bg-white min-h-screen">
      <main>
        {session?.user ? (
  <div className="container mx-auto flex flex-col items-center gap-3 p-3">
    <h1 className="text-black text-6xl">Welcome, {session.user.name}</h1>
    <p className="text-gray-900 text-xl">You are logged in with email: {session.user.email}</p>
  </div>
) : (
  <div>
  You are not logged in.
  </div>
)}


     
      <section className="container mx-auto  flex flex-col items-center gap-3 p-3">
        <h1 className="text-black text-6xl ">MedGenesis Ai health infrastructure </h1>
        <p className="text-gray-900 text-xl">Pakistan&apos;s first ai based health system that connect patients, doctors and hospitals in one click.</p>
        <Test/>
       
      </section>

      <Button onClick={async()=>{

        const result=await signOut();
        if(result.data){
          router.push("/login")
        }else{
          alert("Failed to logout")
        }
      }} className="bg-black cursor-pointer text-gray-200 h-10 w-40 hover:bg-gray-800"
        >Logout </Button>
 
      
     </main>
    </div>
  );
}