# 🧠 Questões do ENEM

Projeto fullstack para cadastro, gerenciamento e visualização de questões do ENEM, com filtros dinâmicos por edição, ano, área e assuntos. Ideal para estudos, revisão e análise estatística.

## 🚀 Acesso ao site

👉 [https://questoesenem.vercel.app](https://questoesenem.vercel.app)

## 📸 Demonstrações

### 🔎 Página de Questões
Filtros por edição, ano, área e assuntos com destaque visual e opção de mostrar apenas questões de Sociologia.

![Questões](https://user-images.githubusercontent.com/.../exemplo1.png)

### ➕ Cadastro de Questões
Formulário para adicionar novas questões com enunciado, alternativas, imagem e múltiplos assuntos.

![Cadastro](https://user-images.githubusercontent.com/.../exemplo2.png)

---

## 🧱 Tecnologias Utilizadas

- **Next.js** (App Router)
- **TypeScript**
- **Supabase** (como backend e banco de dados)
- **Tailwind CSS**
- **Vercel** (Deploy)

---

## 📂 Estrutura de Pastas

```
src/
├── app/
│   ├── questoes/          # Página principal de listagem
│   ├── admin/importar/    # Importação de novas questões
│   ├── estatisticas/      # Página de estatísticas
│   └── layout.tsx         # Layout padrão
├── lib/
│   └── supabaseClient.ts  # Conexão com Supabase
├── styles/
    └── globals.css
```

---

## ⚙️ Como rodar localmente

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Preencha sua URL e chave do Supabase no .env.local

# Rode o servidor local
npm run dev
```

Acesse: `http://localhost:3000`

---

## ✅ Funcionalidades

- ✅ Filtros combináveis por ano, edição, área e assuntos
- ✅ Cadastro de novas questões com imagem e alternativas
- ✅ Visualização de tags coloridas por assunto
- ✅ Marcar alternativas corretas
- ✅ Exportação futura de estatísticas

---

## 🔒 Requisitos de Ambiente

- Node.js 18+
- Conta no [Supabase](https://supabase.com/) com tabela de `questoes` configurada

---

## 📌 TODOs futuros

- [ ] Autenticação de usuários (admin)
- [ ] Exportação de estatísticas em CSV
- [ ] Edição de questões
- [ ] Histórico de tentativas e resultados

---

## 🧑‍💼 Desenvolvido por

Amanda Pontes  
💼 Felipe Ferreira
📧 Felipecordeirofcf@gmail.com

---

