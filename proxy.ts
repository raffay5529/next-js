import { NextRequest,NextResponse } from "next/server";
import {getSesssion} from "@/lib/auth/auth";

export default async function Proxy(request: NextRequest){

  const session=await getSesssion();

  const isDashboardPage=request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginPage=request.nextUrl.pathname.startsWith("/login");


  if(!session?.user && isDashboardPage){
      return NextResponse.redirect(new URL("/login",request.url))
  }
    if(session?.user && isLoginPage){
      return NextResponse.redirect(new URL("/dashboard",request.url))
  }

  return NextResponse.next();

} 