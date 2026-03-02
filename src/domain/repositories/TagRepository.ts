import type { Tag } from "../entities/Tag"

export interface TagRepository {
  saveTag(tag: Tag, userId: string): Promise<void>
  getTags(userId: string): Promise<Tag[]>
  getTagById(id: string): Promise<Tag | null>
}
