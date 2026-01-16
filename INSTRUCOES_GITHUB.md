# INSTRUÇÕES PARA CRIAR O REPOSITÓRIO GITHUB - CANNEO

## Passo 1: Criar o Repositório

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `canneo`
   - **Description:** `CANNEO - Plataforma de Telemedicina Cannabis Medicinal`
   - **Visibility:** `Private` (IMPORTANTE: manter privado)
   - **NÃO** marque "Add a README file"
   - **NÃO** marque "Add .gitignore"
   - **NÃO** marque "Choose a license"
3. Clique em **Create repository**

---

## Passo 2: Configurar Proteção de Branch (Opcional, mas Recomendado)

1. Vá em **Settings** > **Branches**
2. Clique em **Add branch protection rule**
3. Em **Branch name pattern:** digite `main`
4. Marque:
   - [x] Require a pull request before merging
   - [x] Require approvals (1)
5. Clique em **Create**

---

## Passo 3: Adicionar Colaborador

1. Vá em **Settings** > **Collaborators**
2. Clique em **Add people**
3. Digite o email ou username do outro sócio
4. Selecione **Admin** (para ter acesso total)
5. Clique em **Add**

---

## Passo 4: Criar Secrets (Variáveis de Ambiente para CI/CD)

1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets (os valores reais serão preenchidos depois):

| Nome | Descrição |
|------|-----------|
| `DATABASE_URL` | Connection string do Neon.tech |
| `JWT_SECRET` | Chave secreta para JWT (gerar com `openssl rand -base64 32`) |
| `REFRESH_TOKEN_SECRET` | Outra chave para refresh tokens |
| `RESEND_API_KEY` | API key do Resend para emails |
| `DAILY_API_KEY` | API key do Daily.co para vídeo |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Service key do Supabase |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |

---

## Passo 5: Clonar e Fazer Push Inicial

Depois de criar o repo, o sócio que tem os arquivos deve rodar:

```bash
# Navegar até a pasta do projeto
cd "C:\Users\Ulisses\Documents\TELEMEDICINA\canneo"

# Inicializar Git
git init

# Adicionar origin
git remote add origin git@github.com:SEU_USERNAME/canneo.git

# Criar branch main
git branch -M main

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: initial project structure

- Monorepo setup with npm workspaces
- NestJS API structure
- Prisma schema with multi-tenant and billing
- Shared types package

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push para o GitHub
git push -u origin main
```

---

## Passo 6: O Outro Sócio Clona

Depois do push inicial, o outro sócio roda:

```bash
# Clonar o repositório
git clone git@github.com:SEU_USERNAME/canneo.git

# Entrar na pasta
cd canneo

# Instalar dependências
npm install

# Copiar env de exemplo
cp apps/api/.env.example apps/api/.env

# Editar .env com as credenciais
# (vocês compartilham as mesmas credenciais de DB, etc)
```

---

## Configuração SSH (Se ainda não tiver)

Se o Git pedir senha ou der erro de autenticação:

```bash
# 1. Gerar chave SSH
ssh-keygen -t ed25519 -C "seu@email.com"

# 2. Iniciar agente SSH
eval "$(ssh-agent -s)"

# 3. Adicionar chave
ssh-add ~/.ssh/id_ed25519

# 4. Copiar chave pública
cat ~/.ssh/id_ed25519.pub
# (copiar o output)

# 5. Ir no GitHub > Settings > SSH Keys > New SSH Key
# Colar a chave e salvar

# 6. Testar conexão
ssh -T git@github.com
```

---

## Estrutura Final do Repositório

```
canneo/
├── apps/
│   ├── api/           # NestJS Backend
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   └── package.json
│   └── web/           # Next.js Frontend (a criar)
│       ├── src/
│       └── package.json
├── packages/
│   └── shared/        # Tipos compartilhados
│       ├── src/
│       └── package.json
├── .gitignore
├── package.json       # Workspace root
└── README.md
```

---

## Workflow Diário

```bash
# INÍCIO DO DIA
git checkout main
git pull origin main
git checkout -b feature/sua-feature

# DURANTE O DIA
git add .
git commit -m "feat(modulo): descricao"
git push origin feature/sua-feature

# FIM DO DIA
# Criar Pull Request no GitHub
# Outro sócio revisa e aprova
# Merge para main
```

---

## Links Úteis

- GitHub: https://github.com
- Neon (Database): https://neon.tech
- Daily.co (Vídeo): https://daily.co
- Supabase (Storage): https://supabase.com
- Resend (Email): https://resend.com
- Stripe (Pagamentos): https://stripe.com
- Vercel (Deploy Web): https://vercel.com
- Railway (Deploy API): https://railway.app
