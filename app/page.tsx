import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (session !== null) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
