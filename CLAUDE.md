# Notion Clone — Project Instructions

## Overview
A personal Notion-like app: rich text pages, nested blocks, sidebar navigation.
Solo user. Dark-first UI. Built to be clean, fast, and maintainable.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 14 (App Router)                 |
| Language   | TypeScript (strict mode)                |
| Styling    | Tailwind CSS + CSS variables            |
| Components | shadcn/ui (customized, never default)   |
| Animations | Framer Motion                           |
| Database   | Supabase (PostgreSQL)                   |
| ORM        | Prisma                                  |
| Auth       | Supabase Auth                           |
| Deploy     | Vercel                                  |

---

## Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login / signup pages
│   ├── (app)/                  # Protected app pages
│   │   ├── layout.tsx          # Sidebar + main layout
│   │   └── page/[id]/          # Individual page view
│   └── api/                    # API Routes (server actions)
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── editor/                 # Block editor components
│   ├── sidebar/                # Sidebar & navigation
│   └── shared/                 # Reusable across features
├── lib/
│   ├── supabase/               # Supabase client & helpers
│   ├── prisma/                 # Prisma client
│   └── utils.ts                # Shared utilities
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Database schema
└── CLAUDE.md
```

---

## Database Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  pages     Page[]
  createdAt DateTime @default(now())
}

model Page {
  id          String   @id @default(cuid())
  title       String   @default("Untitled")
  icon        String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  parentId    String?
  parent      Page?    @relation("PageChildren", fields: [parentId], references: [id])
  children    Page[]   @relation("PageChildren")
  blocks      Block[]
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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

enum BlockType {
  TEXT
  HEADING_1
  HEADING_2
  HEADING_3
  BULLET_LIST
  NUMBERED_LIST
  CODE
  IMAGE
  DIVIDER
  QUOTE
  TODO
}
```

---

## Design System

### Philosophy
Dark-first. Inspired by Vercel's dashboard: high contrast, generous whitespace,
sharp edges, no gradients. Every pixel intentional.

### Color Palette (CSS variables in globals.css)
```css
:root {
  --background:       #0a0a0a;   /* Near-black */
  --surface:          #111111;   /* Card / panel */
  --surface-hover:    #1a1a1a;   /* Hover state */
  --border:           #222222;   /* Subtle borders */
  --border-strong:    #333333;   /* Visible borders */
  --text-primary:     #ededed;   /* Main text */
  --text-secondary:   #888888;   /* Muted text */
  --text-disabled:    #444444;   /* Disabled state */
  --accent:           #ffffff;   /* Primary accent */
  --accent-muted:     #a0a0a0;   /* Secondary accent */
  --destructive:      #ff4444;   /* Errors / delete */
  --success:          #00cc88;   /* Success states */
}
```

### Typography
- **Display / Headings**: `Geist` (Vercel's font — clean, modern, techy)
- **Body**: `Geist Mono` pour les blocs de code, `Geist` pour le reste
- **Scale**: Use Tailwind's default scale (text-sm, text-base, text-lg, etc.)
- **NEVER use**: Inter, Roboto, Arial, or system-ui as primary fonts

### Component Rules
- shadcn/ui est une base, pas un style final. **Toujours customiser** avec Tailwind.
- Pas de border-radius > `rounded-lg` (max 8px). On reste sharp.
- Shadows légères uniquement : `shadow-sm` ou custom `0 1px 3px rgba(0,0,0,0.5)`
- Animations : subtiles. `duration-150` pour les hovers, `duration-300` pour les transitions de page.

### Animation Patterns (Framer Motion)
```typescript
// Apparition d'un élément
const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 }
}

// Liste d'éléments (stagger)
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } }
}
```

---

## Coding Standards

### TypeScript
- **Strict mode** activé dans `tsconfig.json`
- Toujours typer les props avec une `interface`, pas `type` pour les objets
- Pas de `any`. Si tu ne sais pas le type : `unknown` puis narrow.
- Exporter les types depuis `types/index.ts`

### React / Next.js
- **Server Components par défaut** (App Router). N'ajouter `"use client"` que si nécessaire (interactivité, hooks).
- **Pas de `useEffect` pour fetcher des données** — utiliser les Server Components ou React Query.
- Props toujours destructurées dans la signature de la fonction.
- Un composant = un fichier. Nom du fichier = nom du composant (PascalCase).

```typescript
// ✅ Bon
interface PageTitleProps {
  title: string;
  isEditing?: boolean;
  onSave: (title: string) => void;
}

export const PageTitle = ({ title, isEditing = false, onSave }: PageTitleProps) => {
  return <h1>{title}</h1>;
};

// ❌ Mauvais
export default function pageTitle(props: any) {
  return <h1>{props.title}</h1>;
}
```

### API Routes (Next.js)
- Toutes les routes dans `app/api/`
- Utiliser `NextResponse` pour les réponses
- Toujours valider les inputs (Zod recommandé)
- Format d'erreur uniforme :

```typescript
// Succès
return NextResponse.json({ data: result }, { status: 200 });

// Erreur
return NextResponse.json({ error: "Message clair" }, { status: 400 });
```

### Supabase / Prisma
- **Toujours utiliser Prisma** pour les queries. Jamais de SQL raw.
- Le client Prisma est un singleton dans `lib/prisma/client.ts`
- Les helpers Supabase (auth, storage) dans `lib/supabase/`

---

## Development Workflow

### Avant chaque feature
1. Utilise `/superpowers:brainstorm` pour clarifier le design
2. Utilise `/superpowers:write-plan` pour découper en petites étapes
3. **Écris le test en premier** (TDD) avant le code

### Pendant le développement
- Une feature = une branche git (`feat/nom-de-la-feature`)
- Commits fréquents avec Conventional Commits :
  - `feat:` nouvelle feature
  - `fix:` correction de bug
  - `style:` changement visuel sans logique
  - `refactor:` restructuration sans nouvelle feature
  - `test:` ajout ou modification de tests
  - `chore:` config, dépendances

### Tests
```typescript
// Pattern pour chaque feature
describe('PageTitle', () => {
  it('renders the title', () => { /* ... */ });
  it('enters edit mode on click', () => { /* ... */ });
  it('saves on blur', () => { /* ... */ });
  it('saves on Enter key', () => { /* ... */ });
});
```

### Quand quelque chose casse
Utilise le skill `debugging` de superpowers. Ne pas modifier du code au hasard.

---

## Key Skills to Use

| Situation                        | Skill à invoquer                  |
|----------------------------------|-----------------------------------|
| Démarrer une nouvelle feature    | `/superpowers:brainstorm`         |
| Planifier l'implémentation       | `/superpowers:write-plan`         |
| Quelque chose ne marche pas      | `debugging` (superpowers)         |
| Design de composant complexe     | `software-architecture`           |
| UI / composant visuel            | `frontend-design` (anthropics)    |
| Avant de dire "c'est terminé"    | `verification-before-completion`  |

---

## What NOT to Do

- ❌ Ne pas créer de fichiers dans `node_modules/`
- ❌ Ne pas commiter `.env` ou `.env.local`
- ❌ Ne pas utiliser `any` en TypeScript
- ❌ Ne pas fetch de données dans `useEffect`
- ❌ Ne pas modifier le schéma Prisma sans migration (`prisma migrate dev`)
- ❌ Ne pas hardcoder des couleurs — utiliser les CSS variables
- ❌ Ne pas utiliser des fonts génériques (Inter, Roboto, Arial)
- ❌ Ne pas créer de composants > 200 lignes — découper en sous-composants
