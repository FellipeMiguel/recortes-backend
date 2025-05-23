# API

API RESTful para gerenciamento de recortes, com autenticação via Google OAuth2, upload de imagens para Supabase Storage e documentação completa via Swagger.

---

## Funcionalidades

✅ Autenticação de usuários via Google (Bearer Token)  
✅ CRUD completo de recortes: criar, listar, buscar, atualizar e deletar  
✅ Upload de imagens diretamente para Supabase Storage  
✅ Proteção de rotas: apenas usuários autenticados podem acessar  
✅ Documentação interativa com Swagger  
✅ Validação de dados com Zod

---

## Tecnologias

- Node.js
- Express
- Prisma ORM
- PostgreSQL (via Supabase)
- Supabase Storage
- Google OAuth2
- Zod (validação)
- Multer (upload de arquivos)
- Swagger (OpenAPI)

---

## Instalação

```bash
git clone https://github.com/FellipeMiguel/recortes-backend.git
cd recortes-backend
npm install
```

---

## Configuração

1. **.env** com as variáveis:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_PUBLIC_KEY=chave-publica
SUPABASE_PRIVATE_KEY=chave-privada

GOOGLE_CLIENT_ID=sua-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-client-secret

JWT_SECRET=uma_chave_super_secreta
```

2. Execute as migrations do Prisma:

```bash
npx prisma migrate deploy
```

---

## Execução

```bash
npm run dev
```

Servidor rodando em:  
`http://localhost:3001`

---

## Documentação

Swagger disponível em:  
`http://localhost:3001/api-docs`

---

## Autenticação

Todas as rotas são protegidas.  
Você deve enviar o **Bearer Token** do Google na requisição:

```http
Authorization: Bearer SEU_ID_TOKEN
```

---

## Upload de imagens

O campo `image` deve ser enviado como **multipart/form-data** no `POST` e `PUT` de `/cut`.

---

## Endpoints

| Método | Rota     | Descrição             |
| ------ | -------- | --------------------- |
| POST   | /cut     | Criar um recorte      |
| GET    | /cut     | Listar recorte        |
| GET    | /cut/:id | Buscar recorte por ID |
| PUT    | /cut/:id | Atualizar recorte     |
| DELETE | /cut/:id | Remover recorte       |

---

## Versionamento

Utilizamos **Git Flow** para versionamento.  
A versão atual é: `v1.0.0`

---

## 📄 Licença

MIT License
