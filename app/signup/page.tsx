"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signUp } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router=useRouter();


  return (
    <div className="min-h-screen bg-white flex">
      
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <span className="text-white text-xl font-thin tracking-widest">MedGenesis</span>
        <div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Your health,<br />our priority.
          </h1>
          <p className="text-gray-400 text-lg">
             first AI-based health system. Get started today.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© 2026 MedGenesis. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-10">
            <span className="lg:hidden text-black text-xl font-thin tracking-widest block mb-8">
              MedGenesis
            </span>
            <h2  className="text-3xl font-bold text-black mb-2">Create an account</h2>
            <p className="text-gray-500">Sign up to get started with MedGenesis</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Full Name</label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-gray-200 text-black placeholder:text-gray-400 h-12 focus:border-black focus:ring-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Email</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-200 text-black placeholder:text-gray-400 h-12 focus:border-black focus:ring-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Password</label>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-200 text-black placeholder:text-gray-400 h-12 focus:border-black focus:ring-black"
              />
            </div>

           

            <Button onClick={async()=>{
             const result= await signUp.email ({
                name,
                email,
                password
              });

              if(result.error){
                alert(result.error.message);
              }else {
                router.push("/test");
              }
            }} className="w-full h-12 bg-black text-white hover:bg-gray-800 cursor-pointer text-base mt-2">
              Create Account
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Button */}
          <Button variant="outline" className="w-full h-12 border-gray-200 text-black hover:bg-gray-50 cursor-pointer text-base">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Login Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-medium underline underline-offset-4">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}