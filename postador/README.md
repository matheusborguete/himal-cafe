# Postador da Himal

O postador gera um post de Instagram por dia, pede sua aprovação no Telegram e publica sozinho.
É **100% gratuito e sem cartão**: roda no GitHub Actions, com Gemini (AI Studio), Telegram e Instagram.

```
GitHub Actions (todo dia ~8h)
  → Google News (pauta atual)
  → Gemini escreve título, texto da arte e legenda (sem repetir temas)
  → arte 1080×1350 desenhada com um template da Himal (sem IA)
  → imagem salva no repositório (URL pública via jsDelivr)
  → Telegram: foto + legenda com [✅ Aprovar e publicar] [🔄 Gerar outro]

Você clica em Aprovar
  → na hora, se aprovar nas 4 horas após o envio (ou com "npm run escutar")
  → Instagram: cria o container da imagem → publica → manda o link no Telegram
```

## Arquivos

| Arquivo | O que faz |
|---|---|
| Painel `/admin` → aba **Postador do Instagram** | Edita a marca e os templates, com prévia ao vivo da arte (salva no Firestore) |
| `marca.json` e `templates/*.json` | Valores padrão, usados se o Firestore estiver vazio (o botão "importar padrões" do painel copia esses arquivos) |
| `../public/assets/desenho.js` | Desenho da arte, o mesmo código na prévia do painel e no postador |
| `gerar.js` | Gera o post e manda para o Telegram |
| `verificar.js` | Lê os cliques do Telegram uma vez (usado pelo Actions) |
| `escutar.js` | Fica ouvindo o Telegram e publica na hora (usado ao vivo na aula) |
| `testar-slide.js` | Gera artes de exemplo em `amostras/`, sem precisar de chave |
| `dados/posts.json` | Histórico: cada post, status, tema e link no Instagram |
| `imagens/` | As artes geradas |

## Configuração (uma vez só)

### 1. Gemini (texto)
1. Acesse https://aistudio.google.com/apikey e clique em **Create API key**.
2. Copie a chave para `GEMINI_API_KEY`. O plano gratuito não pede cartão.

### 2. Bot do Telegram (aprovação)
1. No Telegram, abra o **@BotFather**, mande `/newbot` e escolha um nome e um usuário terminado em `bot`.
2. Copie o token para `TELEGRAM_BOT_TOKEN`.
3. Abra o seu bot e mande um "oi".
4. Rode `npm run verificar`. O bot responde com o seu `TELEGRAM_CHAT_ID`.

### 3. Instagram (publicação)
Usa a **API do Instagram**: não precisa de Página do Facebook. Funciona com os dois tipos de token da Meta:
`EAA…` (apps novos, login unificado: `graph.facebook.com` + `IG_USER_ID`) e `IGAA…` (apps antigos: `graph.instagram.com`).
1. No app do Instagram: **Configurações → Tipo de conta e ferramentas → Mudar para conta profissional** (Criador ou Empresa).
2. Em https://developers.facebook.com, entre e clique em **Criar app**. É preciso ter uma conta do Facebook só para entrar no painel de desenvolvedor.
   - Caso de uso: **Gerenciar mensagens e conteúdo no Instagram**.
   - Não precisa vincular portfólio empresarial.
3. Em **Funções do app → Funções**, adicione a conta da marca como **Testador do Instagram**.
   - Aceite o convite no Instagram: **Configurações → Permissões de sites e apps → Apps e sites → Convites de testador**.
4. No painel do app: **Casos de uso → API do Instagram → API setup with Unified login**.
   - **Etapa 1:** **Criar nova configuração** (padrão: token do usuário do sistema, conta do Instagram) e salvar.
   - **Etapa 2:** **Adicionar conta** → entre com o Instagram da marca → **Gerar token** → copie para `IG_TOKEN`.
   - Copie o **número abaixo do @** da conta para `IG_USER_ID`.
   - O app pode ficar em modo de desenvolvimento: publicar na própria conta não exige revisão da Meta.
   - Token `EAA…` (usuário do sistema): o painel indica que não expira. Token `IGAA…` (apps antigos): vale 60 dias.

### 4. Rodar no seu computador
```bash
cd postador
npm install
cp .env.exemplo .env      # preencha as chaves
npm run gerar             # o rascunho chega no Telegram
npm run escutar           # clique em Aprovar e veja o post no Instagram
```

### 5. Deixar rodando sozinho (GitHub Actions)
Envie as chaves do `.env` para os Secrets do repositório:
```bash
gh secret set -f postador/.env
```
Pronto. O workflow **Postador: gerar post** roda todo dia por volta das 8h e fica 4 horas ouvindo o Telegram: se você aprovar nesse intervalo, publica na hora. Fora dessa janela, o **Postador: verificar aprovações** confere a cada 10 minutos, mas o GitHub não garante esse intervalo e pode atrasar bastante.
Para testar na hora, abra a aba **Actions** do GitHub, escolha o workflow e clique em **Run workflow**.

## Personalizar
- **Marca e visual:** no painel `/admin`, aba **Postador do Instagram**. Lá você cria, duplica, desativa e exclui templates, e a prévia mostra exatamente a arte que será publicada.
- **Ver as artes no computador:** `npm run slide` gera um exemplo de cada template ativo em `amostras/`.
- **Horário:** mude o `cron` em `.github/workflows/postador-gerar.yml`. O horário é UTC, ou seja, 3 horas a mais que Brasília.
