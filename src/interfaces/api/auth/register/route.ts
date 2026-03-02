import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { redis } from "@/src/infrastructure/redis/RedisClient"
import { RedisUserRepository } from "@/src/infrastructure/repositories/RedisUserRepository"
import { hashPassword } from "@/src/infrastructure/auth/password"
import type { User } from "@/src/domain/entities/User"

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const userRepo = new RedisUserRepository(redis)

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.REGISTRATION_ENABLED === "false") {
    return NextResponse.json({ error: "Registration is currently disabled" }, { status: 403 })
  }

  const body: unknown = await req.json()
  const parsed = RegisterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()

  const existing = await userRepo.getUserByEmail(email)
  if (existing !== null) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await hashPassword(parsed.data.password)

  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  await userRepo.saveUser(user)

  return NextResponse.json({ message: "Account created successfully" }, { status: 201 })
}
