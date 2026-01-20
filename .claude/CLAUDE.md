# Sift

A keyboard-first todo app for focused, intentional people.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React + Radix UI + Tailwind CSS
- **Database**: Supabase (Postgres + Auth)
- **Hosting**: Vercel
- **Font**: IBM Plex Mono
- **Theme**: Flexoki Light

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main app (4-pane todo view)
│   ├── login/page.tsx    # Magic link login
│   ├── auth/callback/    # Auth callback handler
│   └── layout.tsx        # Root layout with font
├── components/
│   ├── Pane.tsx          # Todo pane component
│   ├── TodoItem.tsx      # Individual todo item
│   ├── QuickAdd.tsx      # "/" quick add modal
│   └── KeyboardHelp.tsx  # "?" help overlay
├── lib/
│   ├── types.ts          # App types (Todo, PaneId, etc.)
│   └── supabase/
│       ├── client.ts     # Browser Supabase client
│       ├── server.ts     # Server Supabase client
│       └── types.ts      # Database types
└── hooks/                # (future) Custom hooks
```

## Key Patterns

### Authentication
- Magic link via Supabase Auth
- Auth callback requires `await supabase.auth.getUser()` after `exchangeCodeForSession()` to trigger cookie setAll before response returns
- No middleware - client-side auth check in page.tsx

### Database
- Schema in `supabase/schema.sql`
- Row Level Security (RLS) enabled - users only see their own data
- Tables: `todos`, `user_context`

### Keyboard Navigation
- Arrow keys: navigate within pane
- 1-4: switch panes (Today, Work, Personal, Waiting)
- `/`: quick add todo
- `?`: show help
- `Space`: toggle complete
- `d`/`Backspace`: delete
- `Esc`: close modals

## Pane Layout

```
┌─────────────────────────────────────┐
│            [1] TODAY                │
├───────────┬───────────┬─────────────┤
│ [2] WORK  │[3] PERSONAL│[4] WAITING │
└───────────┴───────────┴─────────────┘
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Conventions

- All new todos go to "Today" pane (AI categorization planned for future)
- Flexoki color tokens: `paper`, `bg`, `bg-2`, `ui`, `tx`, `tx-2`, `tx-3`
- Use Tailwind classes with Flexoki tokens (e.g., `bg-paper`, `text-tx-2`)
- Monospace font throughout for "power user" aesthetic

## Planned Features

- [ ] Move todos between panes (`m` key)
- [ ] AI auto-categorization with Claude API
- [ ] User context editor (preferences/life context)
- [ ] Inline todo editing
- [ ] Multi-device sync (Supabase realtime)
- [ ] Offline support
