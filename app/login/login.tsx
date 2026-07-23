"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, X } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setErrorMsg(result.error.message ?? "Something went wrong. Please try again.");
        setIsLoading(false);
      } else {
        router.push("/board");
        // Keep spinner while navigating
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/taska.png"
            alt="Taska Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain rounded-xl"
            priority
          />
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
              <Image
                src="/taska.png"
                alt="Taska Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain rounded-lg"
                priority
              />
              <span className="text-slate-900 text-lg font-extrabold tracking-tight">Taska</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your Taska account</p>
          </div>

          {/* Error Toast */}
          {errorMsg && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 flex-1">{errorMsg}</p>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Email</label>
              <Input
                type="email"
                maxLength={100}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Password</label>
              <Input
                type="password"
                maxLength={100}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-base mt-2 rounded-xl font-semibold transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
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
            <Link
              href="/signup"
              className="text-blue-600 font-semibold hover:underline underline-offset-4"
              aria-disabled={isLoading}
              tabIndex={isLoading ? -1 : undefined}
              style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : undefined}
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}