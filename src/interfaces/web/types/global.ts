import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null | undefined
      image?: string | null | undefined
    }
  }

  interface User {
    id: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string | undefined
  }
}
