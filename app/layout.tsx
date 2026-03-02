import type { Metadata } from "next"
import "@radix-ui/themes/styles.css"
import "./globals.css"
import { Theme, Box, Container } from "@radix-ui/themes"
import AuthProvider from "@/components/providers/AuthProvider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import Navbar from "@/components/layout/Navbar"

export const metadata: Metadata = {
  title: "promptapp",
  description: "Create, version, organize and search prompts",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <Theme accentColor="indigo" grayColor="slate" radius="medium" appearance="light">
          <AuthProvider>
            <Box style={{ minHeight: "100vh", backgroundColor: "var(--gray-2)" }}>
              {session !== null && <Navbar />}
              <Container size="4" px="4" py="6">
                {children}
              </Container>
            </Box>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  )
}
