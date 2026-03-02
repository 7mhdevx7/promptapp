import { z } from "zod"

export const CreatePromptSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),
  content: z.string().min(1, "Content is required"),
  description: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional().default("draft"),
  tagIds: z.array(z.string()).optional(),
})

export type CreatePromptDTO = z.infer<typeof CreatePromptSchema>
