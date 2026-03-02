export function now(): string {
  return new Date().toISOString()
}

export function toISOString(date: Date): string {
  return date.toISOString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
