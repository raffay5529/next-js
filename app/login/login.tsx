"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <LayoutGrid size={16} className="text-white" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">Taska</span>
        </div>

        {/* Hero copy */}
        <div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Organize work,<br />ship faster.
          </h1>
          <p className="text-slate-400 text-lg">
            The Kanban board built for teams who move fast.
          </p>
        </div>

        <p className="text-slate-600 text-sm">© 2026 Taska. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-10">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <LayoutGrid size={14} className="text-white" />
              </div>
              <span className="text-slate-900 text-lg font-extrabold tracking-tight">Taska</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your Taska account</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Email</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={async () => {
                const result = await signIn.email({ email, password });
                if (result.error) {
                  alert(result.error.message);
                } else {
                  router.push("/board");
                }
              }}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-base mt-2 rounded-xl font-semibold transition-colors"
            >
              Sign In
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}