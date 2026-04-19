export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Prevent any browser-level scroll on the editor page */}
      <style>{`html, body { overflow: hidden !important; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
        {children}
      </div>
    </>
  )
}
