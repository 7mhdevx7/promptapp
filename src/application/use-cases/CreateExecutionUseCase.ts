import type { PromptRepository } from "@/src/domain/repositories/PromptRepository"
import type { PromptExecutionRepository } from "@/src/domain/repositories/PromptExecutionRepository"
import type { CreateExecutionDTO } from "../dto/CreateExecutionDTO"
import type { PromptExecution } from "@/src/domain/entities/PromptExecution"
import { extractVariables } from "@/src/domain/services/VariableParser"
import { renderTemplate, validateVariablesComplete } from "../services/TemplateRenderer"

export class CreateExecutionUseCase {
  constructor(
    private readonly promptRepo: PromptRepository,
    private readonly executionRepo: PromptExecutionRepository
  ) {}

  async execute(dto: CreateExecutionDTO, userId: string): Promise<PromptExecution> {
    // Get the prompt
    const prompt = await this.promptRepo.getPromptById(dto.promptId)
    if (!prompt) {
      throw new Error("Prompt not found")
    }

    // Get the latest version
    const versions = await this.promptRepo.getVersions(dto.promptId)
    if (versions.length === 0) {
      throw new Error("Prompt has no versions")
    }

    const latestVersion = versions.sort((a, b) => b.versionNumber - a.versionNumber)[0]!
    const templateContent = latestVersion.content

    // Extract required variables from template
    const requiredVariables = extractVariables(templateContent)

    // Validate all required variables are provided
    const validation = validateVariablesComplete(requiredVariables, dto.variables)
    if (!validation.valid) {
      throw new Error(`Missing variables: ${validation.missing.join(", ")}`)
    }

    // Render the template with provided values
    const generatedContent = renderTemplate(templateContent, dto.variables)

    // Create execution record
    const now = new Date().toISOString()
    const execution: PromptExecution = {
      id: crypto.randomUUID(),
      promptId: dto.promptId,
      promptVersionNumber: latestVersion.versionNumber,
      templateContent,
      variables: dto.variables,
      generatedContent,
      createdAt: now,
      createdBy: userId,
    }

    // Save to repository
    await this.executionRepo.saveExecution(execution)

    return execution
  }
}
