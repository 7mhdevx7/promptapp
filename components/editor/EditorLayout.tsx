"use client"

import { useCallback, useMemo, useState } from "react"
import { EditorTabs } from "./EditorTabs"
import { MonacoWrapper } from "./MonacoWrapper"
import { SaveIndicator } from "./SaveIndicator"
import { DocumentSearch } from "./DocumentSearch"
import { MarkdownPreview } from "./MarkdownPreview"
import { MarkdownFullView } from "./MarkdownFullView"
import { DocumentTitleBar } from "./DocumentTitleBar"
import { CommandPalette, type PaletteCommand } from "./CommandPalette"
import { ConflictDialog } from "./ConflictDialog"
import Link from "next/link"
import { useEditorState } from "@/hooks/editor/useEditorState"

export function EditorLayout() {
  const {
    metas,
    openTabs,
    activeTabId,
    activeDoc,
    activeContent,
    saveStatus,
    conflictState,
    showSearch,
    showPalette,
    showMarkdownPreview,
    showMarkdownFullView,
    sessionLoaded,
    setActiveTabId,
    switchToTab,
    openDocument,
    closeTab,
    closeAndDelete,
    newDocument,
    setContent,
    renameDocument,
    downloadDocument,
    resolveConflict,
    setShowSearch,
    setShowPalette,
    setShowMarkdownPreview,
    setShowMarkdownFullView,
  } = useEditorState()

  const [fontSize, setFontSize] = useState(14)
  const increaseFontSize = useCallback(() => setFontSize((s) => s + 2), [])
  const decreaseFontSize = useCallback(() => setFontSize((s) => Math.max(8, s - 2)), [])

  const handleContentChange = useCallback(
    (value: string) => {
      if (activeTabId) setContent(activeTabId, value)
    },
    [activeTabId, setContent]
  )

  const isMarkdown = activeDoc?.extension === "md"

  const paletteCommands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "new-doc",
        label: "New Document",
        description: "Create a new untitled document",
        action: () => void newDocument(),
      },
      {
        id: "open-doc",
        label: "Open Document (⌘P)",
        description: "Search and open a document",
        action: () => setShowSearch(true),
      },
      {
        id: "download",
        label: "Download Current File",
        description: activeDoc ? `${activeDoc.name}.${activeDoc.extension}` : "No file open",
        action: downloadDocument,
      },
      {
        id: "close-tab",
        label: "Close Current Tab",
        description: "Close the active tab",
        action: () => { if (activeTabId) closeTab(activeTabId) },
      },
      ...(isMarkdown
        ? [
            {
              id: "toggle-preview",
              label: showMarkdownPreview ? "Hide split preview" : "Show split preview",
              description: "Side-by-side editor and rendered markdown",
              action: () => setShowMarkdownPreview((v) => !v),
            },
            {
              id: "fullview",
              label: "Open full view",
              description: "Render markdown full screen",
              action: () => setShowMarkdownFullView(true),
            },
          ]
        : []),
    ],
    [
      newDocument, downloadDocument, closeTab, setShowSearch,
      setShowMarkdownPreview, setShowMarkdownFullView,
      activeDoc, activeTabId, isMarkdown, showMarkdownPreview,
    ]
  )

  if (!sessionLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1e1e1e] text-[#858585] text-sm">
        Restoring session…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-8 bg-[#323233] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/prompts"
            className="text-xs text-[#858585] hover:text-[#cccccc] shrink-0"
            title="Back to app"
          >
            ←
          </Link>
          <DocumentTitleBar
          doc={activeDoc}
          onRename={renameDocument}
          onDownload={downloadDocument}
          onDelete={() => { if (activeTabId) void closeAndDelete(activeTabId) }}
        />
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator status={saveStatus} />
          {isMarkdown && (
            <>
              <button
                onClick={() => setShowMarkdownPreview((v) => !v)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  showMarkdownPreview
                    ? "border-[#007acc] text-[#007acc]"
                    : "border-[#3c3c3c] text-[#858585] hover:text-[#cccccc]"
                }`}
                title="Split preview"
              >
                Split
              </button>
              <button
                onClick={() => setShowMarkdownFullView(true)}
                className="text-xs px-2 py-0.5 rounded border border-[#3c3c3c] text-[#858585] hover:text-[#cccccc] hover:border-[#858585] transition-colors"
                title="Full screen view"
              >
                View
              </button>
            </>
          )}
          <div className="flex items-center gap-1 border border-[#3c3c3c] rounded px-1">
            <button
              onClick={decreaseFontSize}
              className="text-xs text-[#858585] hover:text-[#cccccc] px-0.5"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-[10px] text-[#858585] min-w-[2ch] text-center">{fontSize}</span>
            <button
              onClick={increaseFontSize}
              className="text-xs text-[#858585] hover:text-[#cccccc] px-0.5"
              title="Increase font size"
            >
              A+
            </button>
          </div>
          <button
            onClick={() => setShowPalette(true)}
            className="text-xs text-[#858585] hover:text-[#cccccc]"
            title="Command palette (⌘⇧P)"
          >
            ⌘⇧P
          </button>
        </div>
      </div>

      {/* Tabs */}
      <EditorTabs
        tabs={openTabs}
        activeTabId={activeTabId}
        onSelect={switchToTab}
        onClose={closeTab}
        onNew={newDocument}
      />

      {/* Main area: sidebar + editor */}
      <div className="flex flex-1 min-h-0">
        {activeTabId ? (
          <>
            <div className={`flex-1 min-w-0 overflow-hidden ${showMarkdownPreview && isMarkdown ? "w-1/2" : ""}`}>
              <MonacoWrapper
                key={activeTabId}
                value={activeContent}
                extension={activeDoc?.extension ?? "txt"}
                fontSize={fontSize}
                onChange={handleContentChange}
                onSave={() => {}}
              />
            </div>
            {showMarkdownPreview && isMarkdown && (
              <div className="w-1/2 border-l border-[#3c3c3c]">
                <MarkdownPreview content={activeContent} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center gap-4 text-[#858585]">
            <p className="text-sm">No document open</p>
            <button
              onClick={newDocument}
              className="text-xs border border-[#3c3c3c] px-3 py-1.5 rounded hover:border-[#007acc] hover:text-[#cccccc] transition-colors"
            >
              New document
            </button>
            {metas.length > 0 && (
              <button
                onClick={() => setShowSearch(true)}
                className="text-xs text-[#007acc] hover:underline"
              >
                Or open existing (⌘P)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overlays */}
      {showSearch && (
        <DocumentSearch
          docs={metas}
          onSelect={openDocument}
          onClose={() => setShowSearch(false)}
        />
      )}
      {showPalette && (
        <CommandPalette
          commands={paletteCommands}
          onClose={() => setShowPalette(false)}
        />
      )}
      {showMarkdownFullView && activeDoc && (
        <MarkdownFullView
          content={activeContent}
          filename={`${activeDoc.name}.${activeDoc.extension}`}
          onClose={() => setShowMarkdownFullView(false)}
        />
      )}
      {conflictState && (
        <ConflictDialog conflict={conflictState} onResolve={resolveConflict} />
      )}
    </div>
  )
}
