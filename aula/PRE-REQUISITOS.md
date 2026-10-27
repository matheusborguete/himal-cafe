# Pré-requisitos: aula "Automação com IA + Futuro da IA"

**Quando:** 28/10/2026, das 19h às 23h (online)
**O que vamos construir:** um postador de Instagram que escreve o post com IA, desenha a arte com o template da marca, pede sua aprovação no Telegram e publica sozinho. Tudo gratuito e sem cartão de crédito.

Reserve **40 minutos antes da aula** para preparar o ambiente. Se algo travar, não tem problema: venha assim mesmo. Na aula, todo mundo acompanha, e quem não conseguir construir junto recebe o código pronto de cada etapa.

---

## O que é pago e o que é gratuito

| Ferramenta | Para que usamos | Custo | Alternativa gratuita |
|---|---|---|---|
| **GitHub** + GitHub Actions | Guardar o código e rodar o robô todo dia | Gratuito (repositório público) | — |
| **Google AI Studio** (Gemini) | IA que escreve o post | Gratuito, com limite diário | — |
| **Firebase** (Google Cloud), plano Spark | Site, blog e painel | Gratuito, sem cartão | — |
| **Telegram** | Aprovar o post pelo celular | Gratuito | — |
| **Meta for Developers** + Instagram profissional | Publicar no Instagram | Gratuito | — |
| **Microsoft Clarity** | Ver como as pessoas usam o site | Gratuito | — |
| **Claude Code** | Construir o projeto conversando com a IA | **Pago** (a partir do Claude Pro, ~US$ 20/mês) | **Google Antigravity** (gratuito, com limite semanal) |
| Tarefas agendadas no **Claude** (Cowork) | Relatórios automáticos | **Pago** (Claude Pro ou superior) | Tarefas agendadas do **ChatGPT** (até 3 no plano gratuito) ou do **Antigravity** |
| **Semrush** | Pesquisa de SEO | Gratuito com 10 consultas por dia | Google Search Console, PageSpeed Insights |

> Os preços e limites mudam com frequência. Confira no site de cada ferramenta.
> Você **não precisa** assinar nada para a aula. Com o Antigravity você faz tudo de graça.

---

## Nível 1: obrigatório (para acompanhar a aula)

### 1. Contas
- [ ] **Conta Google** (Gmail). É a mesma para AI Studio, Firebase e Antigravity.
- [ ] **Conta no GitHub:** https://github.com/signup
- [ ] **Telegram** instalado no celular, com conta criada.
- [ ] **Instagram** da sua marca, ou um perfil de teste. Ele vai precisar virar **conta profissional**, o que é gratuito e reversível (passo 6).
- [ ] **Conta no Facebook.** A Meta exige o login para entrar no painel de desenvolvedor. Não precisa de Página.

### 2. Programas no computador
Instale nesta ordem (Windows ou Mac):

- [ ] **Node.js 22 ou mais novo (LTS):** https://nodejs.org
- [ ] **Git:** https://git-scm.com/downloads (no Mac, digite `git` no Terminal e aceite a instalação)
- [ ] **GitHub CLI:** https://cli.github.com
- [ ] **Uma IA de programação**, escolha uma:
  - **Claude Code** (se você tem Claude Pro): https://claude.com/claude-code. O aplicativo desktop já inclui o Claude Code.
  - **Google Antigravity** (gratuito): https://antigravity.google
- [ ] **Python 3.11 ou mais novo**: https://www.python.org/downloads. Só é necessário para o plugin de auditoria de SEO.

Confira se deu certo. Abra o terminal (no Windows, PowerShell; no Mac, Terminal) e rode:

```bash
node -v
```
```bash
git --version
```
```bash
gh --version
```

O `node -v` precisa mostrar `v22` ou maior.

### 3. Entrar no GitHub pelo terminal
```bash
gh auth login
```
Escolha **GitHub.com → HTTPS → Login with a web browser** e confirme o código no navegador.

### 4. Chave do Gemini (gratuita)
1. Acesse https://aistudio.google.com/apikey
2. Clique em **Create API key** e escolha **um projeto novo, sem faturamento**.
3. Guarde a chave num bloco de notas **só seu**. Ela é uma senha: não mande no chat da aula, nem em print.

> ⚠️ Se você criar a chave num projeto do Google Cloud que **tem cartão cadastrado**, ela usa o plano pago. Quando os créditos acabam, aparece o erro `402 prepayment credits are depleted`. Use um projeto sem faturamento.

### 5. Bot do Telegram
1. No Telegram, procure **@BotFather** e mande `/newbot`.
2. Escolha um nome (ex.: `Postador do Café da Joana`) e um usuário terminado em `bot` (ex.: `cafejoana_postador_bot`).
3. O BotFather devolve um **token** (`123456:ABC...`). Guarde junto com a chave do Gemini. É outra senha.
4. Abra o seu bot (clique no link que o BotFather mandou) e envie **oi**.

### 6. Instagram profissional
No app do Instagram: **Configurações → Tipo de conta e ferramentas → Mudar para conta profissional** (Criador ou Empresa).
Não precisa vincular a uma Página do Facebook.

---

## Nível 2: recomendado (se sobrar tempo antes da aula)

### 7. Microsoft Clarity no seu site
Se você tem um site, crie um projeto gratuito em https://clarity.microsoft.com e cole o código no `<head>`.
Quanto antes instalar, mais dados você terá na aula.

### 8. Criar o app na Meta (pode deixar para a aula)
Faremos isso juntos, mas, se quiser adiantar:
1. Entre em https://developers.facebook.com com sua conta do Facebook e aceite os termos de desenvolvedor.
2. **Meus apps → Criar app** → caso de uso **Gerenciar mensagens e conteúdo no Instagram**.
3. Pare aqui. O restante (testador e token) fazemos na aula.

### 9. Sua cópia do site (Firebase, sem cartão)
Para ter **seu próprio** painel com a aba do postador:
1. Clone o ponto de partida da aula:
   ```bash
   git clone -b sprint-0 https://github.com/matheusborguete/himal-cafe.git meu-cafe
   ```
2. Instale o Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. Abra a pasta `meu-cafe` no Claude Code ou no Antigravity e peça:
   > Siga o CLAUDE.md e crie a minha cópia deste projeto no meu Google Cloud.

A IA cria o projeto no Firebase, e você só faz um passo manual de 1 minuto: ativar o login por e-mail e criar o seu usuário.
Se não der tempo, sem problema: o postador funciona sem o painel, com os templates num arquivo.

---

## Checklist final

- [ ] `node -v` mostra v22 ou maior
- [ ] `gh auth status` mostra que você está logado
- [ ] Claude Code ou Antigravity abrindo
- [ ] Chave do Gemini guardada
- [ ] Token do bot guardado e "oi" enviado para o bot
- [ ] Instagram como conta profissional
- [ ] Login no developers.facebook.com funcionando

## Segurança (vale para sempre)
- Chaves e tokens são **senhas**. Nunca cole no chat da aula, no WhatsApp ou em print de tela.
- Eles ficam num arquivo `.env` que **não vai para o GitHub**. O projeto já está configurado para isso.
- Se uma chave vazar, apague e crie outra: no AI Studio, no BotFather (`/revoke`) ou na Meta.
