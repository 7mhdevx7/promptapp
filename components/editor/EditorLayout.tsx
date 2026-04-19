"use client"

import { useCallback, useMemo } from "react"
import { EditorTabs } from "./EditorTabs"
import { MonacoWrapper } from "./MonacoWrapper"
import { SaveIndicator } from "./SaveIndicator"
import { DocumentSearch } from "./DocumentSearch"
import { MarkdownPreview } from "./MarkdownPreview"
import { MarkdownFullView } from "./MarkdownFullView"
import { FileTree } from "./FileTree"
import { DocumentTitleBar } from "./DocumentTitleBar"
import { CommandPalette, type PaletteCommand } from "./CommandPalette"
import { useEditorState } from "@/hooks/editor/useEditorState"

export function EditorLayout() {
  const {
    metas,
    openTabs,
    activeTabId,
    activeDoc,
    activeContent,
    saveStatus,
    showSearch,
    showPalette,
    showMarkdownPreview,
    showMarkdownFullView,
    sessionLoaded,
    setActiveTabId,
    openDocument,
    closeTab,
    newDocument,
    setContent,
    renameDocument,
    downloadDocument,
    setShowSearch,
    setShowPalette,
    setShowMarkdownPreview,
    setShowMarkdownFullView,
  } = useEditorState()

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
        <DocumentTitleBar
          doc={activeDoc}
          onRename={renameDocument}
          onDownload={downloadDocument}
        />
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
        onSelect={setActiveTabId}
        onClose={closeTab}
        onNew={newDocument}
      />

      {/* Main area: sidebar + editor */}
      <div className="flex flex-1 min-h-0">
        <FileTree
          metas={metas}
          activeTabId={activeTabId}
          onOpen={openDocument}
          onNew={newDocument}
        />

        {activeTabId ? (
          <>
            <div className={`flex-1 min-w-0 overflow-hidden ${showMarkdownPreview && isMarkdown ? "w-1/2" : ""}`}>
              <MonacoWrapper
                key={activeTabId}
                value={activeContent}
                extension={activeDoc?.extension ?? "txt"}
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
    </div>
  )
}
