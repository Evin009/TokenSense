import React from "react"

// Lightweight stand-in for next/link in test environments
const Link = ({
  href,
  children,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
  <a href={href} className={className} {...rest}>
    {children}
  </a>
)

export default Link
