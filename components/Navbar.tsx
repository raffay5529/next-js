"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth/auth-client"
import { LogOut, ChevronDown, Mail } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const PAGE_LABELS: Record<string, string> = {
  "/board": "Board",
}

function getPageLabel(pathname: string): string | null {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  return null
}

function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const firstName = name.split(" ")[0]

  async function handleSignOut() {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer group"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 hidden sm:block">
          {firstName}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={11} className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          </div>
          <div className="p-1.5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={14} className="text-rose-500" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const pathname = usePathname()
  const pageLabel = getPageLabel(pathname)

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/taska.png"
              alt="Taska Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-xl"
              priority
            />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Taska
            </span>
          </Link>

          {pageLabel && (
            <>
              <span className="text-slate-300 text-lg font-light select-none">/</span>
              <span className="text-sm font-semibold text-slate-500">{pageLabel}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="w-24 h-8 rounded-xl bg-slate-100 animate-pulse" />
          ) : session?.user ? (
            <UserMenu
              name={session.user.name ?? "User"}
              email={session.user.email ?? ""}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="h-8 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="h-8 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center transition-colors shadow-sm"
              >
                Start for free
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}