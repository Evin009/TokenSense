"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

function CursorElements() {
  const outerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: -500, y: -500 })
  const currentRef = useRef({ x: -500, y: -500 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = e.clientX
      const y = e.clientY
      targetRef.current = { x, y }

      // Glow layer — instant response
      if (outerRef.current) {
        outerRef.current.style.background = [
          `radial-gradient(60px circle at ${x}px ${y}px, rgba(0,255,136,0.08), transparent 100%)`,
          `radial-gradient(200px circle at ${x}px ${y}px, rgba(0,255,136,0.04), transparent 100%)`,
          `radial-gradient(500px circle at ${x}px ${y}px, rgba(0,255,136,0.015), transparent 100%)`,
        ].join(", ")
      }

      // Dot — snaps exactly to cursor
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`
        dotRef.current.style.opacity = "1"
      }
    }

    // Ring lags behind via rAF lerp
    function tick() {
      const t = targetRef.current
      const c = currentRef.current
      c.x += (t.x - c.x) * 0.12
      c.y += (t.y - c.y) * 0.12

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${c.x - 16}px, ${c.y - 16}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    function onLeave() {
      if (outerRef.current) outerRef.current.style.background = "none"
      if (dotRef.current) dotRef.current.style.opacity = "0"
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* Suppress the OS cursor globally */}
      <style>{`* { cursor: none !important; }`}</style>

      {/* Multi-layer radiant glow */}
      <div
        ref={outerRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 99996,
        }}
      />

      {/* Lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          border: "1px solid rgba(0,255,136,0.2)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99997,
          willChange: "transform",
        }}
      />

      {/* Crisp center dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#00FF88",
          boxShadow: "0 0 4px 1px rgba(0,255,136,0.4)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform",
          opacity: 0,
        }}
      />
    </>
  )
}

// Portal to document.body so section stacking contexts can never cover the cursor
export function CursorGlow() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(<CursorElements />, document.body)
}
