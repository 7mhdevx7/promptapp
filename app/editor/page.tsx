import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { EditorLayout } from "@/components/editor/EditorLayout"

export const metadata = { title: "Editor" }

export default async function EditorPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#1e1e1e] text-[#858585] text-sm">
          Loading…
        </div>
      }
    >
      <EditorLayout />
    </Suspense>
  )
}
