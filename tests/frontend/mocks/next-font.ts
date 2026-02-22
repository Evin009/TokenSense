// Mock for next/font — returns empty class names so font loading is skipped
const mockFont = () => ({ className: "", style: { fontFamily: "" } })
export const JetBrains_Mono = mockFont
export const Inter = mockFont
export default mockFont
