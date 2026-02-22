import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "TokenSense — AI Orchestration Engine",
  description:
    "Reduce LLM token usage by up to 72% with semantic retrieval, context compression, and intelligent model routing.",
  keywords: ["AI", "LLM", "token optimization", "RAG", "context compression"],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-mono antialiased bg-ts-page text-ts-text min-h-screen">
        {children}
      </body>
    </html>
  )
}
