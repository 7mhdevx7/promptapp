"use client"

import dynamic from "next/dynamic"
import type { EditorProps } from "@monaco-editor/react"

// Heavy bundle (~2MB) — loaded only when editor mounts (bundle-dynamic-imports)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-[#858585] text-sm">
      Loading editor…
    </div>
  ),
})

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  py: "python",
  rs: "rust",
  go: "go",
  json: "json",
  md: "markdown",
  html: "html",
  css: "css",
  sh: "shell",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  txt: "plaintext",
}

interface MonacoWrapperProps {
  value: string
  extension: string
  onChange: (value: string) => void
  onSave: () => void
}

export function MonacoWrapper({ value, extension, onChange, onSave }: MonacoWrapperProps) {
  const language = EXTENSION_LANGUAGE_MAP[extension] ?? "plaintext"

  const handleEditorMount: EditorProps["onMount"] = (editor, monaco) => {
    editor.focus()
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })
  }

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={(val) => onChange(val ?? "")}
      onMount={handleEditorMount}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        scrollbar: {
          vertical: "auto",
          horizontal: "hidden",
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 0,
          useShadows: false,
        },
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        lineNumbers: "on",
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
      }}
    />
  )
}
