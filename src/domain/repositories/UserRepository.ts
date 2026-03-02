import type { User } from "../entities/User"

export interface UserRepository {
  saveUser(user: User): Promise<void>
  getUserByEmail(email: string): Promise<User | null>
  getUserById(id: string): Promise<User | null>
}
