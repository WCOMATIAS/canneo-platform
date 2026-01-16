# CANNEO

Plataforma de Telemedicina para Cannabis Medicinal.

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 + Tailwind + shadcn/ui
- **Database:** PostgreSQL (Neon.tech)
- **Video:** Daily.co
- **Storage:** Supabase Storage
- **Email:** Resend
- **Billing:** Stripe

## Estrutura

```
canneo/
├── apps/
│   ├── api/           # NestJS Backend
│   └── web/           # Next.js Frontend
├── packages/
│   └── shared/        # Tipos compartilhados
└── package.json       # Workspace root
```

## Setup Local

```bash
# 1. Clonar
git clone git@github.com:SEU_USERNAME/canneo.git
cd canneo

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env com suas credenciais

# 4. Gerar Prisma Client
npm run db:generate

# 5. Rodar migrations
npm run db:migrate

# 6. Seed (apenas primeira vez)
npm run db:seed

# 7. Iniciar desenvolvimento
npm run dev:api  # Terminal 1
npm run dev:web  # Terminal 2
```

## Portas

| Serviço | Porta |
|---------|-------|
| API | 3000 |
| Web | 3001 |
| Prisma Studio | 5555 |

## Scripts

```bash
npm run dev:api       # Inicia API em modo dev
npm run dev:web       # Inicia Web em modo dev
npm run build         # Build de todos os workspaces
npm run db:generate   # Gera Prisma Client
npm run db:migrate    # Roda migrations
npm run db:studio     # Abre Prisma Studio
```

## Contribuindo

1. Crie uma branch: `git checkout -b feature/nome-da-feature`
2. Faça commits: `git commit -m "feat(modulo): descricao"`
3. Push: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

## Licença

Proprietário - CANNEO Health
