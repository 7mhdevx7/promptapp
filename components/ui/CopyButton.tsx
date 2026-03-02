"use client"

import { useState } from "react"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"
import { Button } from "@radix-ui/themes"

type CopyState = "idle" | "copied"

interface CopyButtonProps {
  /** Direct string to copy. */
  text?: string
  /** Async getter — used when the text must be fetched before copying. */
  getText?: () => Promise<string>
  disabled?: boolean
}

export default function CopyButton({ text, getText, disabled }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle")

  async function handleClick() {
    const content = getText ? await getText() : text
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setState("copied")
      setTimeout(() => setState("idle"), 2000)
    } catch {
      // Silent fail — clipboard API unavailable
    }
  }

  return (
    <Button
      type="button"
      variant="soft"
      color={state === "copied" ? "green" : "gray"}
      size="1"
      onClick={handleClick}
      disabled={disabled}
    >
      {state === "copied" ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
