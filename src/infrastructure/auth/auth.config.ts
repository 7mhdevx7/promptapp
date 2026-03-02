import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { redis } from "@/src/infrastructure/redis/RedisClient"
import { RedisUserRepository } from "@/src/infrastructure/repositories/RedisUserRepository"
import { verifyPassword } from "./password"

const userRepo = new RedisUserRepository(redis)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials === undefined) {
          console.log("[AUTH] credentials is undefined")
          return null
        }

        const email = credentials.email?.trim().toLowerCase()
        const password = credentials.password

        console.log("[AUTH] Attempting login for:", email)

        if (!email || !password) {
          console.log("[AUTH] Missing email or password")
          return null
        }

        try {
          const user = await userRepo.getUserByEmail(email)
          console.log("[AUTH] User found:", user !== null ? "YES" : "NO")
          if (user === null) {
            console.log("[AUTH] No user with email:", email)
            return null
          }

          const valid = await verifyPassword(password, user.passwordHash)
          console.log("[AUTH] Password valid:", valid)
          if (!valid) {
            console.log("[AUTH] Invalid password")
            return null
          }

          console.log("[AUTH] Login SUCCESS for:", email)
          return { id: user.id, email: user.email }
        } catch (err) {
          console.error("[AUTH] Error during authorize:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user !== undefined) {
        token["userId"] = user.id
      }
      return token
    },
    async session({ session, token }) {
      const userId = token["userId"]
      if (typeof userId === "string") {
        session.user.id = userId
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
