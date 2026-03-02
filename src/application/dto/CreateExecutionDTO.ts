import { z } from "zod"

export const ExecutionVariableSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
})

export const CreateExecutionSchema = z.object({
  promptId: z.string(),
  variables: z.array(ExecutionVariableSchema).default([]),
})

export type CreateExecutionDTO = z.infer<typeof CreateExecutionSchema>
