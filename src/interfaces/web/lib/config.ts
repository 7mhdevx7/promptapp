import { redis } from "@/src/infrastructure/redis/RedisClient"
import { RedisPromptRepository } from "@/src/infrastructure/repositories/RedisPromptRepository"
import { RedisTagRepository } from "@/src/infrastructure/repositories/RedisTagRepository"
import { RedisGroupRepository } from "@/src/infrastructure/repositories/RedisGroupRepository"
import { RedisUserRepository } from "@/src/infrastructure/repositories/RedisUserRepository"
import { RedisPromptExecutionRepository } from "@/src/infrastructure/repositories/RedisPromptExecutionRepository"
import { CreatePromptUseCase } from "@/src/application/use-cases/CreatePromptUseCase"
import { UpdatePromptUseCase } from "@/src/application/use-cases/UpdatePromptUseCase"
import { GetPromptUseCase } from "@/src/application/use-cases/GetPromptUseCase"
import { SearchPromptsUseCase } from "@/src/application/use-cases/SearchPromptsUseCase"
import { CreateTagUseCase } from "@/src/application/use-cases/CreateTagUseCase"
import { CreateGroupUseCase } from "@/src/application/use-cases/CreateGroupUseCase"
import { CreateExecutionUseCase } from "@/src/application/use-cases/CreateExecutionUseCase"
import { GetExecutionHistoryUseCase } from "@/src/application/use-cases/GetExecutionHistoryUseCase"

const promptRepo = new RedisPromptRepository(redis)
const tagRepo = new RedisTagRepository(redis)
const groupRepo = new RedisGroupRepository(redis)
const userRepo = new RedisUserRepository(redis)
const executionRepo = new RedisPromptExecutionRepository(redis)

export const container = {
  createPromptUseCase: new CreatePromptUseCase(promptRepo),
  updatePromptUseCase: new UpdatePromptUseCase(promptRepo),
  getPromptUseCase: new GetPromptUseCase(promptRepo),
  searchPromptsUseCase: new SearchPromptsUseCase(promptRepo),
  createTagUseCase: new CreateTagUseCase(tagRepo),
  createGroupUseCase: new CreateGroupUseCase(groupRepo),
  createExecutionUseCase: new CreateExecutionUseCase(promptRepo, executionRepo),
  getExecutionHistoryUseCase: new GetExecutionHistoryUseCase(executionRepo),
  promptRepo,
  tagRepo,
  groupRepo,
  userRepo,
  executionRepo,
}
