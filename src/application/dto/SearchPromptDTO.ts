import { z } from "zod"

export const SearchPromptSchema = z.object({
  q: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
})

export type SearchPromptDTO = z.infer<typeof SearchPromptSchema>
