"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";



export default function Test() {
  

  return (
    <>
      <Link href="/login">
    <Button className="bg-black cursor-pointer text-gray-200 h-10 w-40 hover:bg-gray-800"
        >Get Started</Button>
    </Link></>
  
  );
}