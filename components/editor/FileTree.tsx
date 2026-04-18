"use client"

import { useState, useMemo, useCallback } from "react"
import type { DocumentMeta } from "@/lib/editor/types"

interface TreeNode {
  type: "folder" | "file"
  name: string
  path: string
  doc?: DocumentMeta
  children: TreeNode[]
}

function buildTree(metas: DocumentMeta[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const meta of metas) {
    // Virtual path: name may be "folder/subfolder/file", extension is separate
    const parts = meta.name.split("/")
    const fileName = parts[parts.length - 1] ?? meta.name
    const folders = parts.slice(0, -1)

    let nodes = root
    let pathAccum = ""

    for (const folder of folders) {
      pathAccum = pathAccum ? `${pathAccum}/${folder}` : folder
      let folderNode = nodes.find((n) => n.type === "folder" && n.name === folder)
      if (!folderNode) {
        folderNode = { type: "folder", name: folder, path: pathAccum, children: [] }
        nodes.push(folderNode)
      }
      nodes = folderNode.children
    }

    nodes.push({
      type: "file",
      name: `${fileName}.${meta.extension}`,
      path: meta.name,
      doc: meta,
      children: [],
    })
  }

  return root
}

interface FileTreeNodeProps {
  node: TreeNode
  activeTabId: string | null
  depth: number
  onOpen: (id: string) => void
}

function FileTreeNode({ node, activeTabId, depth, onOpen }: FileTreeNodeProps) {
  const [open, setOpen] = useState(true)
  const indent = depth * 12

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ paddingLeft: indent + 8 }}
          className="w-full flex items-center gap-1.5 py-1 text-xs text-[#cccccc] hover:bg-[#2a2d2e] text-left"
        >
          <span className="text-[#858585]">{open ? "▾" : "▸"}</span>
          <span>{node.name}</span>
        </button>
        {open && node.children.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            activeTabId={activeTabId}
            depth={depth + 1}
            onOpen={onOpen}
          />
        ))}
      </div>
    )
  }

  const isActive = node.doc?.id === activeTabId

  return (
    <button
      onClick={() => node.doc && onOpen(node.doc.id)}
      style={{ paddingLeft: indent + 8 }}
      className={`w-full flex items-center gap-1.5 py-1 text-xs text-left truncate
        ${isActive ? "bg-[#094771] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"}`}
    >
      <span className="text-[#858585] font-mono shrink-0">
        {node.doc?.extension ?? ""}
      </span>
      <span className="truncate">{node.name}</span>
    </button>
  )
}

interface FileTreeProps {
  metas: DocumentMeta[]
  activeTabId: string | null
  onOpen: (id: string) => void
  onNew: () => void
}

export function FileTree({ metas, activeTabId, onOpen, onNew }: FileTreeProps) {
  const tree = useMemo(() => buildTree(metas), [metas])

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3c3c3c] w-48 shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858585]">
          Documents
        </span>
        <button
          onClick={onNew}
          className="text-[#858585] hover:text-[#cccccc] text-base leading-none"
          title="New document"
          aria-label="New document"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[#858585]">No documents yet</p>
        ) : (
          tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              activeTabId={activeTabId}
              depth={0}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  )
}
