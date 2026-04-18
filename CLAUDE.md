# promptapp — CLAUDE.md

## Stack

- **Next.js 15** App Router, React 19, TypeScript
- **Auth**: NextAuth 4 (credentials + JWT), session tiene `session.user.id`
- **DB**: Upstash Redis (`@upstash/redis`) — cliente en `src/infrastructure/redis/RedisClient.ts`
- **UI**: Tailwind CSS 3 + Radix UI Themes
- **Deploy**: Vercel

## Arquitectura

Sigue Clean Architecture:
- `src/domain/` — entidades y repositorios (interfaces)
- `src/application/` — use-cases y DTOs
- `src/infrastructure/` — implementaciones Redis + auth
- `src/interfaces/api/` — rutas duplicadas (ignorar, usar las de `app/api/`)
- `app/api/` — API routes activas de Next.js
- `components/` — componentes React
- `hooks/` — hooks reutilizables
- `lib/` — utilidades puras

## Features

### 1. Prompt Manager (feature original)
- CRUD de prompts con grupos, tags, ejecuciones
- Rutas: `/prompts`, `/groups`, `/tags`

### 2. Editor (feature nueva — 2026-04-18)
- Editor de texto tipo Sublime basado en Monaco Editor
- Ruta: `/editor`
- Stack adicional: `@monaco-editor/react`, `react-markdown`

**Estructura editor:**
```
app/editor/page.tsx                         # página (server, auth guard)
app/api/editor/documents/route.ts           # GET list, POST create
app/api/editor/documents/[docId]/route.ts   # GET, PUT, DELETE
app/api/editor/session/route.ts             # GET, PUT (tabs abiertas)
lib/editor/types.ts                         # tipos TS
lib/editor/redis.ts                         # capa de datos Redis
hooks/editor/useDocuments.ts                # CRUD docs
hooks/editor/useAutosave.ts                 # debounce save (800ms)
hooks/editor/useEditorState.ts             # estado global del editor
components/editor/EditorLayout.tsx          # layout principal
components/editor/EditorTabs.tsx            # barra de tabs
components/editor/MonacoWrapper.tsx         # Monaco con next/dynamic
components/editor/DocumentSearch.tsx        # overlay Cmd+P
components/editor/MarkdownPreview.tsx       # preview .md con next/dynamic
components/editor/SaveIndicator.tsx         # indicador "Saving…" / "Saved"
components/editor/DocumentTitleBar.tsx      # título editable + botón descarga
components/editor/CommandPalette.tsx        # overlay Cmd+Shift+P
components/editor/FileTree.tsx              # sidebar con jerarquía virtual
```

**Modelo Redis:**
- `user:{userId}:documents` → lista de IDs
- `document:{docId}` → contenido string
- `document:{docId}:meta` → JSON DocumentMeta
- `user:{userId}:session` → JSON { openTabIds, activeTabId }

**Atajos:**
- `Cmd+S` — guardar inmediato (vía Monaco command)
- `Cmd+P` — buscador de documentos
- `Cmd+W` — cerrar tab activa
- `Cmd+Shift+P` — command palette

**Sync:** polling cada 5s sobre el doc activo (last-write-wins)

## Variables de entorno requeridas

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXTAUTH_SECRET
NEXTAUTH_URL
REGISTRATION_ENABLED   # "true" | "false"
```

## Bugs conocidos / notas

- `src/interfaces/api/` es código duplicado — las rutas activas están en `app/api/`
- Monaco se carga con `next/dynamic` + `ssr: false` para evitar errores de hidratación
