# Notion-like App — Project Instructions

## Overview
A personal productivity app combining Notes, Reminders, and Calendar in one place.
Solo user. Liquid Glass aesthetic (Apple iOS inspired). Mobile-first, deployed on Vercel.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 14 (App Router)             |
| Language   | TypeScript (strict mode)            |
| Styling    | Tailwind CSS + CSS variables        |
| Components | shadcn/ui (always customized)       |
| Animations | Framer Motion                       |
| Database   | Supabase (PostgreSQL)               |
| ORM        | Prisma                              |
| Auth       | Supabase Auth                       |
| Deploy     | Vercel                              |

---

## Project Structure

```
/
├── app/
│   ├── (auth)/                 # Login / signup pages
│   ├── (app)/
│   │   ├── layout.tsx          # Bottom nav + sidebar shell
│   │   ├── today/              # Dashboard Today (default on open)
│   │   ├── page/[id]/          # Individual notes page
│   │   ├── reminders/          # Reminders module
│   │   └── calendar/           # Calendar module
│   └── api/                    # API Routes
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── editor/                 # Block editor components
│   ├── sidebar/                # Notes sidebar & navigation
│   ├── nav/                    # Bottom navigation bar
│   ├── reminders/              # Reminder components
│   ├── calendar/               # Calendar components
│   ├── today/                  # Today dashboard components
│   └── shared/                 # Reusable across modules
├── lib/
│   ├── supabase/               # Supabase client & helpers
│   ├── prisma/                 # Prisma client singleton
│   └── utils.ts
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript type definitions
└── prisma/
    └── schema.prisma
```

---

## Navigation Architecture (Mobile-first)

Bottom navigation bar with 4 tabs — always visible:
- 🏠 **Today** — default on open, dashboard view
- 📝 **Notes** — existing page/block editor
- ⏰ **Reminders** — task & reminder module
- 📅 **Calendar** — schedule & events module

On desktop: bottom nav becomes a fixed left sidebar with the same 4 icons.
Each module has its own internal sidebar (left drawer on mobile) for sub-navigation.

---

## Design System — Liquid Glass

### Philosophy
Mobile-first. Apple Liquid Glass aesthetic: frosted surfaces floating above a background image.
Every surface feels like glass. No solid dark backgrounds.

### Background
- Full-screen background image, fixed (does not scroll)
- Default: misty Japanese bamboo forest (Unsplash URL)
- User can change via Settings → Wallpaper (URL input, saved to localStorage)

### Glass Surface (apply to all panels, cards, blocks, menus)
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### CSS Variables (globals.css)
```css
:root {
  --background:       transparent;
  --surface:          rgba(255, 255, 255, 0.08);
  --surface-hover:    rgba(255, 255, 255, 0.13);
  --border:           rgba(255, 255, 255, 0.15);
  --border-strong:    rgba(255, 255, 255, 0.25);
  --text-primary:     rgba(255, 255, 255, 0.92);
  --text-secondary:   rgba(255, 255, 255, 0.55);
  --text-disabled:    rgba(255, 255, 255, 0.3);
  --accent:           rgba(255, 255, 255, 0.95);
  --destructive:      rgba(255, 87, 87, 0.9);
  --success:          rgba(0, 204, 136, 0.9);
}
```

### Border Radius
- Panels, cards, modals : `16px`
- Buttons, inputs, blocks : `12px`
- Small elements (badges, tags) : `8px`
- **No sharp edges anywhere**

### Typography
- **Font**: Inter (Google Fonts, weights 400/500/600)
- Body: `--text-primary`, line-height 1.6
- Headings: white, font-weight 600
- H1: 2rem, letter-spacing -0.02em
- H2: 1.5rem
- H3: 1.25rem
- Code blocks: Geist Mono
- **NEVER use**: Geist, Roboto, Arial, system-ui as primary font

### Animations (Framer Motion)
```typescript
const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 }
}
```
- Hover transitions: `duration-150`
- Page transitions: `duration-300`
- Drawer open/close: slide + blur increase

---

## Database Models

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  pages     Page[]
  reminders Reminder[]
  events    Event[]
  createdAt DateTime   @default(now())
}

model Page {
  id        String   @id @default(cuid())
  title     String   @default("Untitled")
  icon      String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  parentId  String?
  parent    Page?    @relation("PageChildren", fields: [parentId], references: [id])
  children  Page[]   @relation("PageChildren")
  blocks    Block[]
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Block {
  id        String    @id @default(cuid())
  pageId    String
  page      Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  type      BlockType
  content   Json
  order     Int
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Reminder {
  id          String        @id @default(cuid())
  title       String
  description String?
  dueAt       DateTime?
  priority    Priority      @default(NORMAL)
  isDone      Boolean       @default(false)
  isDeleted   Boolean       @default(false)
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  listId      String?
  list        ReminderList? @relation(fields: [listId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ReminderList {
  id        String     @id @default(cuid())
  name      String
  color     String?
  userId    String
  reminders Reminder[]
  createdAt DateTime   @default(now())
}

model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  startAt     DateTime
  endAt       DateTime
  color       String?
  isRecurring Boolean  @default(false)
  recurrence  String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum BlockType {
  TEXT HEADING_1 HEADING_2 HEADING_3
  BULLET_LIST NUMBERED_LIST CODE
  IMAGE DIVIDER QUOTE TODO
}

enum Priority { LOW NORMAL HIGH }
```

---

## Coding Standards

### TypeScript
- Strict mode activé
- Props typées avec `interface`, pas `type`
- Pas de `any` — utiliser `unknown` puis narrow
- Types exportés depuis `types/index.ts`

### React / Next.js
- Server Components par défaut
- `"use client"` uniquement si nécessaire
- Pas de `useEffect` pour fetcher — Server Components ou React Query
- Props destructurées dans la signature
- Un composant = un fichier, PascalCase
- Composants > 200 lignes → découper

### API Routes
- Toutes dans `app/api/`, valider avec Zod
- `return NextResponse.json({ data }, { status: 200 })`
- `return NextResponse.json({ error: "Message" }, { status: 400 })`

### Prisma / Supabase
- Toujours Prisma pour les queries, jamais de SQL raw
- Supabase uniquement pour auth et storage

### Mobile
- Touch targets minimum 44px
- Tester sur viewport 390px (iPhone 14)
- Toujours `-webkit-backdrop-filter` avec `backdrop-filter`
- Pas de hover-only interactions

---

## Development Workflow

1. `/superpowers:brainstorm` avant toute feature
2. `/superpowers:write-plan` pour découper
3. TDD sauf features purement visuelles
4. Une feature = une branche `feat/nom`
5. Conventional commits : `feat:` `fix:` `style:` `refactor:`

### Règles absolues
- ❌ Ne jamais commiter `.env`
- ❌ Ne jamais hardcoder des couleurs
- ❌ Ne jamais modifier Prisma sans migration
- ❌ Ne jamais utiliser `any`
- ❌ Ne jamais fetch dans `useEffect`
- ❌ Ne jamais oublier `-webkit-backdrop-filter`

---

## Key Skills

| Situation                     | Skill                            |
|-------------------------------|----------------------------------|
| Nouvelle feature              | `/superpowers:brainstorm`        |
| Planifier l'implémentation    | `/superpowers:write-plan`        |
| Bug / erreur                  | `debugging` (superpowers)        |
| Avant de dire "c'est terminé" | `verification-before-completion` |
