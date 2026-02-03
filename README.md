# 🌿 CANNEO - Plataforma de Telemedicina Canabinoide

Plataforma completa de telemedicina especializada em tratamentos com cannabis medicinal.

## 🏥 Portais

| Portal | URL | Descrição |
|--------|-----|-----------|
| **Médico** | medico.canneo.com.br | Portal para médicos prescritores |
| **Paciente** | web.canneo.com.br | Portal para pacientes |
| **Admin** | adm.canneo.com.br | Painel administrativo |
| **Farmácia** | farma.canneo.com.br | Portal para farmácias |

## 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Monorepo:** Turborepo + pnpm
- **Ícones:** Material Symbols
- **Deploy:** PM2 + Nginx

## 📁 Estrutura

```
canneo/
├── apps/
│   ├── doctor/     # Portal do Médico (porta 3002)
│   ├── patient/    # Portal do Paciente (porta 3003)
│   ├── admin/      # Portal Admin (porta 3000)
│   └── pharmacy/   # Portal Farmácia (porta 3004)
├── packages/
│   └── shared/     # Componentes compartilhados
└── docs/           # Documentação e designs
```

## 🚀 Instalação

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção (PM2)
pm2 start ecosystem.config.js
```

## 📊 Status dos Portais

- ✅ Portal Médico: 30 páginas
- ✅ Portal Paciente: 34 páginas
- ⏳ Portal Admin: Em desenvolvimento
- ⏳ Portal Farmácia: Em desenvolvimento

## 📝 Licença

Propriedade de CANNEO. Todos os direitos reservados.
