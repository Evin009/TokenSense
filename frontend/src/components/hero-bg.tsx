"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number; y: number
  vx: number; vy: number
  baseVx: number; baseVy: number
  r: number
  opacity: number
}

/**
 * Full-page fixed canvas mesh.
 * Particles are ATTRACTED toward the cursor from medium range
 * and REPELLED at close range — creating a gathering-constellation effect.
 */
export function HeroBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -3000, y: -3000 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ctx = el.getContext("2d")
    if (!ctx) return
    const canvas: HTMLCanvasElement = el

    const ACCENT = "0, 255, 136"
    const N = 160
    const ATTRACT_DIST = 260  // particles drawn toward cursor beyond this are unaffected
    const REPEL_DIST = 75     // inside this they scatter away
    const CONNECT_DIST = 170

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Scatter particles across the section bounds
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: 0, vy: 0,
      baseVx: (Math.random() - 0.5) * 0.3,
      baseVy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.4 + 0.2,
    }))

    function onMouseMove(e: MouseEvent) {
      // Mouse position relative to the canvas (section-local)
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    function onMouseLeave() {
      mouseRef.current = { x: -3000, y: -3000 }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    function draw() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      const { x: mx, y: my } = mouseRef.current

      for (const p of particles) {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < ATTRACT_DIST && d > 0) {
          if (d < REPEL_DIST) {
            // ── Hard repulsion at close range ──────────────
            const force = ((REPEL_DIST - d) / REPEL_DIST) * 2.5
            p.vx += (dx / d) * force
            p.vy += (dy / d) * force
          } else {
            // ── Soft attraction at medium range ────────────
            // Strength peaks in the middle of the attract band
            const t = (d - REPEL_DIST) / (ATTRACT_DIST - REPEL_DIST) // 0=edge of repel, 1=edge of attract
            const force = (1 - t) * 0.55  // strongest close to repel boundary
            p.vx -= (dx / d) * force
            p.vy -= (dy / d) * force
          }
        }

        // Damping + drift back to base velocity
        p.vx = p.vx * 0.92 + p.baseVx * 0.08
        p.vy = p.vy * 0.92 + p.baseVy * 0.08

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 5) { p.vx = (p.vx / speed) * 5; p.vy = (p.vy / speed) * 5 }

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      // ── Draw connecting lines ─────────────────────────────
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)

          if (d < CONNECT_DIST) {
            // Lines near cursor are brighter
            const mdx = (particles[i].x + particles[j].x) / 2 - mx
            const mdy = (particles[i].y + particles[j].y) / 2 - my
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
            const boost = mDist < ATTRACT_DIST ? (1 - mDist / ATTRACT_DIST) * 0.25 : 0

            const baseAlpha = (1 - d / CONNECT_DIST) * 0.18
            ctx!.beginPath()
            ctx!.strokeStyle = `rgba(${ACCENT}, ${baseAlpha + boost})`
            ctx!.lineWidth = mDist < ATTRACT_DIST ? 0.8 + boost * 1.5 : 0.6
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
          }
        }
      }

      // ── Draw nodes ────────────────────────────────────────
      for (const p of particles) {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        const proximity = d < ATTRACT_DIST ? Math.max(0, 1 - d / ATTRACT_DIST) : 0

        const r = p.r + proximity * 3
        const alpha = p.opacity + proximity * 0.55

        // Outer halo on nearby particles
        if (proximity > 0.15) {
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, r * 5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${ACCENT}, ${proximity * 0.06})`
          ctx!.fill()

          ctx!.beginPath()
          ctx!.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${ACCENT}, ${proximity * 0.1})`
          ctx!.fill()
        }

        // Core dot
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${ACCENT}, ${alpha})`
        ctx!.fill()
      }

      // ── Cursor rings ──────────────────────────────────────
      if (mx > 0 && my > 0) {
        // Outer ring
        ctx!.beginPath()
        ctx!.arc(mx, my, REPEL_DIST, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(${ACCENT}, 0.04)`
        ctx!.lineWidth = 1
        ctx!.stroke()

        // Inner glow disc
        const grad = ctx!.createRadialGradient(mx, my, 0, mx, my, REPEL_DIST)
        grad.addColorStop(0, `rgba(${ACCENT}, 0.06)`)
        grad.addColorStop(1, `rgba(${ACCENT}, 0)`)
        ctx!.beginPath()
        ctx!.arc(mx, my, REPEL_DIST, 0, Math.PI * 2)
        ctx!.fillStyle = grad
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1, opacity: 0.85 }}
    />
  )
}
