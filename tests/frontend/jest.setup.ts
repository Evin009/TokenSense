import "@testing-library/jest-dom"

// Silence framer-motion "ResizeObserver" warning in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock requestAnimationFrame (used by framer-motion and canvas)
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  setTimeout(() => cb(0), 0)
  return 0
}
global.cancelAnimationFrame = () => {}

// Mock HTMLCanvasElement.getContext (used by HeroBg)
HTMLCanvasElement.prototype.getContext = () => null

// Silence console.error for known React test warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : ""
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(") ||
      msg.includes("not wrapped in act")
    ) {
      return
    }
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})
