# CANNEO - Handover para Wanderson

## Resumo do Projeto

CANNEO é uma plataforma de telemedicina especializada em cannabis medicinal. O projeto utiliza:
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + shadcn/ui
- **Estado**: Zustand + TanStack Query (React Query)
- **Monorepo**: estrutura com `apps/api` e `apps/web`

---

## O Que Foi Feito Nesta Sessão

### 1. Portal do Paciente (`apps/web/src/app/(patient-portal)/`)
- Layout dedicado com sidebar e header próprios
- `/patient-dashboard` - Dashboard do paciente
- `/my-consultations` - Consultas do paciente
- `/my-prescriptions` - Prescrições do paciente
- `/my-documents` - Documentos KYC
- `/my-profile` - Perfil do paciente
- `/patient-help` - Ajuda

### 2. Super Admin Dashboard (`apps/web/src/app/(super-admin)/`)
- Layout exclusivo para Super Admins
- `/super-admin` - Dashboard com estatísticas gerais
- `/super-admin/doctors` - Lista de médicos
- `/super-admin/doctors/[id]` - Detalhes do médico (com tabs de pacientes, consultas, laudos, prescrições)
- `/super-admin/patients` - Lista de pacientes com KYC
- `/super-admin/patients/[id]` - Detalhes do paciente (dados pessoais, médicos, documentos KYC, histórico)

### 3. API do Super Admin (`apps/api/src/modules/super-admin/`)
- `super-admin.module.ts`
- `super-admin.service.ts`
- `super-admin.controller.ts`
- Endpoints:
  - `GET /super-admin/dashboard`
  - `GET /super-admin/doctors`
  - `GET /super-admin/doctors/:id`
  - `GET /super-admin/doctors/:id/patients`
  - `GET /super-admin/doctors/:id/consultations`
  - `GET /super-admin/doctors/:id/reports`
  - `GET /super-admin/doctors/:id/prescriptions`
  - `GET /super-admin/patients`
  - `GET /super-admin/patients/:id`
  - `GET /super-admin/organizations`
  - `GET /super-admin/audit-logs`

### 4. Sistema de Autenticação Atualizado
- Suporte ao role PATIENT no login
- Redirecionamento automático baseado no role:
  - SUPER_ADMIN → `/super-admin`
  - PATIENT → `/patient-dashboard`
  - Outros → `/dashboard`
- `SuperAdminGuard` para proteger rotas de super admin
- Hierarquia de roles: SUPER_ADMIN(200) > OWNER(100) > ADMIN(80) > DOCTOR(60) > SECRETARY(40) > VIEWER(20) > PATIENT(10)

### 5. Páginas do Dashboard Principal
- `/consultations`
- `/schedule`
- `/medical-records`
- `/anvisa-reports`
- `/organization`
- `/settings`
- `/help`

---

## Estrutura de Arquivos Importantes

```
apps/
├── api/
│   └── src/
│       ├── common/guards/
│       │   ├── super-admin.guard.ts    # Guard de Super Admin
│       │   └── roles.guard.ts          # Hierarquia de roles
│       └── modules/
│           └── super-admin/            # Módulo completo do Super Admin
│               ├── super-admin.module.ts
│               ├── super-admin.service.ts
│               └── super-admin.controller.ts
└── web/
    └── src/
        ├── app/
        │   ├── (dashboard)/            # Dashboard principal (médicos)
        │   ├── (patient-portal)/       # Portal do paciente
        │   └── (super-admin)/          # Dashboard do Super Admin
        ├── components/layout/
        │   ├── patient-sidebar.tsx
        │   ├── patient-header.tsx
        │   ├── super-admin-sidebar.tsx
        │   └── super-admin-header.tsx
        ├── hooks/
        │   ├── use-auth.ts             # Hook de autenticação
        │   └── use-super-admin.ts      # Hooks do Super Admin
        └── stores/
            └── auth-store.ts           # Store de autenticação
```

---

## Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/WCOMATIAS/canneo-platform.git
cd canneo-platform
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar o banco de dados
Criar arquivo `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/canneo"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_REFRESH_SECRET="outra_chave_secreta"
```

### 4. Rodar migrations
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar os serviços
```bash
# Terminal 1 - API (porta 3001)
cd apps/api
npm run start:dev

# Terminal 2 - Web (porta 3000)
cd apps/web
npm run dev
```

---

## Próximos Passos Sugeridos

1. **Implementar funcionalidades reais nas páginas placeholder** (consultations, schedule, medical-records, etc.)
2. **Integrar WebRTC para videochamadas** - Daily.co ou Twilio
3. **Implementar assinatura digital** (D4Sign ou Clicksign)
4. **Upload de documentos** - AWS S3 ou similar
5. **Notificações em tempo real** - WebSocket/Socket.io
6. **Envio de emails** - SendGrid ou AWS SES
7. **Testes automatizados**
8. **CI/CD e Deploy**

---

## Credenciais de Teste

Para criar um Super Admin, execute no banco:
```sql
-- Primeiro crie um usuário e depois crie uma membership com role SUPER_ADMIN
INSERT INTO "Membership" ("id", "userId", "organizationId", "role", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'USER_ID_AQUI', 'ORG_ID_AQUI', 'SUPER_ADMIN', true, NOW(), NOW());
```

---

## Contato

Se tiver dúvidas, consulte:
- Código no GitHub: https://github.com/WCOMATIAS/canneo-platform
- Documentação do NestJS: https://docs.nestjs.com
- Documentação do Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com

---

*Última atualização: Janeiro 2026*
