"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ApiKeyModal } from "@/components/api-key-modal"

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "DOCS", href: "/docs" },
  { label: "PLAYGROUND", href: "/playground" },
  { label: "DASHBOARD", href: "/dashboard" },
]

export function Navbar() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <nav
        className="flex items-center justify-between h-16 px-20 bg-ts-surface sticky top-0 z-50"
        style={{ borderBottom: "1px solid #00FF88" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-ts-accent font-mono text-base font-semibold tracking-wider"
        >
          TokenSense
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`font-mono text-xs font-medium tracking-widest transition-colors ${
                pathname === href
                  ? "text-ts-accent"
                  : "text-ts-muted hover:text-ts-text"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="font-mono text-xs font-bold text-ts-accent px-4 py-2.5 transition-colors hover:bg-ts-accent hover:text-ts-page"
          style={{ border: "1px solid #00FF88" }}
        >
          GET API KEY
        </button>
      </nav>

      {showModal && <ApiKeyModal onClose={() => setShowModal(false)} />}
    </>
  )
}
