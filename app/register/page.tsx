"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Flex,
  Heading,
  Text,
  TextField,
  Button,
  Callout,
  Card,
} from "@radix-ui/themes"

export default function RegisterPage() {
  // TODO: temporarily disable registration
  return null;
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = (await res.json()) as { error?: string | { formErrors?: string[] } }
      if (typeof data.error === "string") {
        setError(data.error)
      } else if (
        data.error?.formErrors !== undefined &&
        data.error.formErrors.length > 0
      ) {
        setError(data.error.formErrors[0] ?? "Registration failed")
      } else {
        setError("Registration failed")
      }
      return
    }

    router.push("/login")
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
      <Box style={{ width: "100%", maxWidth: "28rem" }}>
        <Card size="4">
          <Heading size="5" mb="5">
            Create account
          </Heading>

          {error !== null && (
            <Callout.Root color="red" size="1" mb="4">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text
                  as="label"
                  htmlFor="email"
                  size="2"
                  weight="medium"
                  mb="1"
                  style={{ display: "block" }}
                >
                  Email
                </Text>
                <TextField.Root
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ width: "100%" }}
                />
              </Box>

              <Box>
                <Text
                  as="label"
                  htmlFor="password"
                  size="2"
                  weight="medium"
                  mb="1"
                  style={{ display: "block" }}
                >
                  Password
                </Text>
                <TextField.Root
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="min 8 characters"
                  style={{ width: "100%" }}
                />
              </Box>

              <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </Flex>
          </form>

          <Text as="p" size="2" color="gray" align="center" mt="4">
            Already have an account?{" "}
            <Text asChild color="indigo" size="2">
              <Link href="/login">Sign in</Link>
            </Text>
          </Text>
        </Card>
      </Box>
    </Flex>
  )
}
