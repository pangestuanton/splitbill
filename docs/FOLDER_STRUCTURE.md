# Folder Structure

```text
SPLITBILL/
├── hp/                         # Catatan/mockup khusus tampilan HP
├── prisma/                     # Prisma schema dan seed
├── public/                     # Asset publik
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, AppShell
│   │   ├── ui/                 # Button, Input, Card, Badge
│   │   └── splitbill/          # Komponen khusus SplitBill
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utility dan logic kalkulasi
│   ├── types/                  # TypeScript types
│   └── data/                   # Dummy/sample data
├── docs/                       # Dokumentasi tambahan
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── DESIGN.md
├── PRD.md
├── README.md
└── TODO.md
```

Catatan:

- `.next` tidak dimasukkan karena hasil build/dev server.
- `node_modules` tidak dimasukkan karena hasil `npm install`.
- `.env` asli tidak dimasukkan demi keamanan.
