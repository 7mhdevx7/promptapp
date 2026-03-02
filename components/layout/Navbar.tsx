"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Box, Flex, Button, Text } from "@radix-ui/themes"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prompts", label: "Prompts" },
  { href: "/tags", label: "Tags" },
  { href: "/groups", label: "Groups" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <Box style={{ backgroundColor: "var(--gray-12)", color: "white" }} px="4" py="3">
      <Flex align="center" justify="between">
        <Flex align="center" gap="6">
          <Link
            href="/dashboard"
            style={{
              fontWeight: "bold",
              fontSize: "1.125rem",
              color: "white",
              textDecoration: "none",
              letterSpacing: "-0.015em",
            }}
          >
            promptapp
          </Link>
          <Flex gap="1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "0.875rem",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-2)",
                    color: isActive ? "white" : "var(--gray-8)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    textDecoration: "none",
                    transition: "color 0.15s, background-color 0.15s",
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </Flex>
        </Flex>
        <Button
          variant="ghost"
          color="gray"
          size="2"
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ color: "var(--gray-8)", cursor: "pointer" }}
        >
          <Text size="2">Sign out</Text>
        </Button>
      </Flex>
    </Box>
  )
}
