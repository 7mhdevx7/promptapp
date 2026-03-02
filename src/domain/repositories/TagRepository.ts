import type { Tag } from "../entities/Tag"

export interface TagRepository {
  saveTag(tag: Tag): Promise<void>
  getTags(): Promise<Tag[]>
  getTagById(id: string): Promise<Tag | null>
}
