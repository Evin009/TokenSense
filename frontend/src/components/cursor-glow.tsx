"use client"

import { useEffect, useRef } from "react"

export function CursorGlow() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  // Inner glow follows instantly; outer ring lags for a "comet tail" feel
  const targetRef = useRef({ x: -500, y: -500 })
  const currentRef = useRef({ x: -500, y: -500 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = e.clientX
      const y = e.clientY

      targetRef.current = { x, y }

      // Outer multi-layer glow — instant update for immediate radiance
      if (outerRef.current) {
        outerRef.current.style.background = [
          // Tiny bright core
          `radial-gradient(60px circle at ${x}px ${y}px, rgba(0,255,136,0.08), transparent 100%)`,
          // Medium inner bloom
          `radial-gradient(200px circle at ${x}px ${y}px, rgba(0,255,136,0.04), transparent 100%)`,
          // Wide ambient
          `radial-gradient(500px circle at ${x}px ${y}px, rgba(0,255,136,0.015), transparent 100%)`,
        ].join(", ")
      }
    }

    // Lagging inner ring uses rAF for smooth interpolation
    function tick() {
      const t = targetRef.current
      const c = currentRef.current
      c.x += (t.x - c.x) * 0.12
      c.y += (t.y - c.y) * 0.12

      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${c.x - 20}px, ${c.y - 20}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    function onLeave() {
      if (outerRef.current) outerRef.current.style.background = "none"
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
      {/* Multi-layer radiant glow */}
      <div
        ref={outerRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 6 }}
      />

      {/* Lagging dot ring that trails the cursor */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 7,
          width: 32,
          height: 32,
          border: "1px solid rgba(0,255,136,0.2)",
          borderRadius: "50%",
          willChange: "transform",
        }}
      />

      {/* Crisp center dot — snaps exactly to cursor */}
      <style>{`
        * { cursor: none !important; }
        a, button, [role="button"], input, select, textarea { cursor: none !important; }
      `}</style>
      <CustomCursorDot />
    </>
  )
}

function CustomCursorDot() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!ref.current) return
      ref.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      ref.current.style.opacity = "1"
    }
    function onLeave() {
      if (!ref.current) return
      ref.current.style.opacity = "0"
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        zIndex: 8,
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#00FF88",
        boxShadow: "0 0 4px 1px rgba(0,255,136,0.4)",
        opacity: 0,
        willChange: "transform",
      }}
    />
  )
}
