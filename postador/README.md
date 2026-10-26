# Postador da Himal

O postador gera um post de Instagram por dia, pede sua aprovação no Telegram e publica sozinho.
É **100% gratuito e sem cartão**: roda no GitHub Actions, com Gemini (AI Studio), Telegram e Instagram.

```
GitHub Actions (todo dia 9h)
  → Google News (pauta atual)
  → Gemini escreve título, texto da arte e legenda (sem repetir temas)
  → arte 1080×1350 desenhada com um template da Himal (sem IA)
  → imagem salva no repositório (URL pública via jsDelivr)
  → Telegram: foto + legenda com [✅ Aprovar e publicar] [🔄 Gerar outro]

Você clica em Aprovar
  → (a cada 10 min no Actions, ou na hora com "npm run escutar")
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
Usa a **Instagram API com login do Instagram**: não precisa de Página do Facebook.
1. No app do Instagram: **Configurações → Tipo de conta e ferramentas → Mudar para conta profissional** (Criador ou Empresa).
2. Em https://developers.facebook.com, entre e clique em **Criar app**. É preciso ter uma conta do Facebook só para entrar no painel de desenvolvedor.
   - Caso de uso: **Gerenciar mensagens e conteúdo no Instagram**.
   - Não precisa vincular portfólio empresarial.
3. No painel do app: **Instagram → Configuração da API com login do Instagram**.
4. Em **Funções do app → Funções**, adicione a conta da marca como **Testador do Instagram**.
   - Aceite o convite no Instagram: **Configurações → Permissões de sites e apps → Apps e sites → Convites de testador**.
5. Volte em **Gerar tokens de acesso → Adicionar conta**, entre com a conta da marca e copie o token para `IG_TOKEN`.
   - O app pode ficar em modo de desenvolvimento: publicar na própria conta não exige revisão da Meta.
   - O token vale **60 dias**. Para renovar, gere outro no mesmo lugar.

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
Pronto. O workflow **Postador: gerar post** roda todo dia às 9h, e o **Postador: verificar aprovações** roda a cada 10 minutos.
Para testar na hora, abra a aba **Actions** do GitHub, escolha o workflow e clique em **Run workflow**.

## Personalizar
- **Marca e visual:** no painel `/admin`, aba **Postador do Instagram**. Lá você cria, duplica, desativa e exclui templates, e a prévia mostra exatamente a arte que será publicada.
- **Ver as artes no computador:** `npm run slide` gera um exemplo de cada template ativo em `amostras/`.
- **Horário:** mude o `cron` em `.github/workflows/postador-gerar.yml`. O horário é UTC, ou seja, 3 horas a mais que Brasília.
