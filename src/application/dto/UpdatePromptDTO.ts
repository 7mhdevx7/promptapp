import { z } from "zod"

export const UpdatePromptSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  changelog: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export type UpdatePromptDTO = z.infer<typeof UpdatePromptSchema>
