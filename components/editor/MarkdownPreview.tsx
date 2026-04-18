"use client"

import dynamic from "next/dynamic"

// react-markdown is loaded only for .md files (bundle-conditional)
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] p-6 prose prose-invert prose-sm max-w-none
      prose-headings:text-[#cccccc] prose-p:text-[#cccccc] prose-code:text-[#ce9178]
      prose-pre:bg-[#252526] prose-a:text-[#4fc1ff]">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
