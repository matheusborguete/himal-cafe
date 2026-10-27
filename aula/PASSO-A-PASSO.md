# Passo a passo: Automação com IA

Guia da aula de 28/10/2026, para o professor e para os alunos.
Antes de começar, faça os [pré-requisitos](PRE-REQUISITOS.md).

**O que vamos construir:** a Himal, uma marca de café especial do Nepal, vai ganhar duas coisas:
1. **Agendados de IA** que auditam o SEO do site, resumem os dados do Clarity e escrevem posts para o blog.
2. **Um postador de Instagram** que busca uma pauta atual, escreve o post com IA, desenha a arte com o template da marca, pede aprovação no Telegram e publica sozinho todo dia.

**Site de exemplo:** https://himal-cafe.web.app · **Código:** https://github.com/matheusborguete/himal-cafe

---

## Sumário

- [Parte 1: Agendados de IA (19h00)](#parte-1-agendados-de-ia)
  - [1.1 Claude × ChatGPT × Antigravity](#11-claude--chatgpt--antigravity)
  - [1.2 Auditoria de SEO com conectores](#12-auditoria-de-seo-com-conectores-no-claude)
  - [1.3 Agendado do Clarity](#13-agendado-do-relatório-do-clarity)
  - [1.4 Agendado de post de blog](#14-agendado-de-post-de-blog)
- [Parte 2: Arquitetura e primeiras sprints (20h25)](#parte-2-arquitetura-e-primeiras-sprints)
  - [2.1 Como funciona](#21-como-o-postador-funciona)
  - [2.2 As peças](#22-as-peças-github-google-cloud-meta-e-telegram)
  - [2.3 Preparar o projeto](#23-preparar-o-projeto)
  - [Sprint 1: Interface](#sprint-1-interface-de-marca-e-templates)
  - [Sprint 2: Gerador](#sprint-2-gerador-pauta--ia--arte)
- [Parte 3: Bot, Meta e piloto automático (21h50)](#parte-3-bot-meta-e-piloto-automático)
  - [Sprint 3: Bot do Telegram](#sprint-3-bot-do-telegram)
  - [Sprint 4: Publicar no Instagram](#sprint-4-publicar-no-instagram)
  - [Sprint 5: GitHub Actions](#sprint-5-piloto-automático-no-github-actions)
  - [Se sobrar tempo: evoluções](#se-sobrar-tempo-evoluções)
- [Checkpoints: se travar, pule para a etapa pronta](#checkpoints-se-travar-pule-para-a-etapa-pronta)
- [Problemas comuns](#problemas-comuns)
- [Segurança](#segurança)

---

## Parte 1: Agendados de IA

### 1.1 Claude × ChatGPT × Antigravity

Um **agendado** é um prompt que roda sozinho num horário: todo dia às 8h, toda segunda e assim por diante. A IA executa, usa as ferramentas que você liberou e entrega o resultado.

| | Claude (Cowork / Chat) | ChatGPT (Tarefas) | Google Antigravity |
|---|---|---|---|
| Onde cria | Barra lateral **Agendados** ou `/schedule` | Peça "todo dia às 8h, faça…" ou menu **Tarefas** | Painel **Scheduled Tasks** ou `/schedule` |
| Plano | Pago (Pro ou superior) | Gratuito: até 3 tarefas, 1 vez por dia | Gratuito (limite semanal) |
| Acessa arquivos do PC | Sim (Cowork) | Não | Sim (pasta do projeto) |
| Conectores | Muitos (Gmail, Drive, Clarity…) | Alguns (Gmail, Agenda) | Ferramentas de programação, terminal |
| Melhor para | Relatórios com dados reais | Lembretes, pautas e textos | Tarefas técnicas no código |

> **Regra de ouro:** o agendado roda sem você olhando. Escreva o prompt como uma **ordem de serviço completa**, com objetivo, fontes, formato da resposta e o que fazer quando faltar dado.

### 1.2 Auditoria de SEO com conectores no Claude

**O que é um conector:** é uma ponte entre o Claude e outra ferramenta (padrão MCP). Com ele, o Claude **lê dados reais** da ferramenta em vez de supor. Você conecta uma vez e ele fica disponível no Chat, no Cowork e nos agendados.

**Onde:** Claude → **Configurações → Conectores → Explorar** → escolha o conector → **Conectar** (você faz login na ferramenta e autoriza). Dá para desconectar a qualquer momento.

| Conector | O que traz para a auditoria | Custo |
|---|---|---|
| Busca na web (nativo) | Lê as páginas: títulos, descrições, estrutura, conteúdo para IA | Incluso no Claude |
| **Semrush** (usado na aula) | Concorrentes, palavras-chave, volume, posição, backlinks | Usa os limites do seu plano do Semrush |
| Microsoft Clarity | Comportamento: rolagem, cliques de raiva, páginas | Gratuito |
| Windsor.ai | Google Search Console e GA4 do seu próprio site | Plano gratuito (1 fonte de dados) |
| Ahrefs · OpenRush | Palavras-chave, SERP, backlinks | Pagos (assinatura ou créditos) |

> Os conectores do diretório dependem do seu plano do Claude e do plano de cada ferramenta. Confira em Configurações → Conectores.

**Por que olhar os concorrentes?** O site da Himal é novo e ainda não tem dados de busca. Os concorrentes já têm. O Semrush mostra em quais palavras-chave eles aparecem, com que volume e em que posição, e isso vira a pauta do nosso site e do blog.

**1. Auditar o site** (no Claude Chat, pela busca na web):
> Faça uma auditoria de SEO e GEO de https://himal-cafe.web.app (home, /blog e um post do blog): títulos, descrições, headings, dados estruturados (JSON-LD), links internos e conteúdo para buscas feitas por IA (ChatGPT, Perplexity, AI Overviews). Entregue em tabela: problema · impacto (alto/médio/baixo) · como corrigir.

**2. Conectar o Semrush:** Configurações → Conectores → Explorar → **Semrush** → Conectar.

**3. Estudar os concorrentes** (com o Semrush):
> Quais são os principais concorrentes orgânicos para "café especial" e "café do Nepal" no Brasil? Traga as palavras-chave principais de cada um, o volume de busca e a posição.

> Em quais palavras-chave eles aparecem e a Himal não? Escolha 10 com bom volume e dificuldade baixa ou média. Entregue em tabela: oportunidade · volume · concorrente · ação sugerida (página nova, post no blog ou ajuste).

> Que perguntas sobre café especial as pessoas fazem? Sugira 5 posts para o blog da Himal.

Outras perguntas que funcionam: o tráfego estimado de um concorrente, as páginas que mais trazem visitas para ele e de onde vêm os backlinks.

**4. Fechar:** *"Junte a auditoria e as oportunidades numa lista de tarefas priorizada por impacto × esforço."*

**Sem Semrush?** Faça a parte do site pela busca na web: o prompt é o mesmo e funciona no ChatGPT e no Antigravity. A conta gratuita no site do Semrush permite cerca de 10 consultas por dia. Complete com as ferramentas gratuitas do Google: [PageSpeed Insights](https://pagespeed.web.dev), [Teste de pesquisa aprimorada](https://search.google.com/test/rich-results) e [Search Console](https://search.google.com/search-console).

**Transforme em agendado:** a análise vira uma tarefa semanal que acompanha os concorrentes e avisa só o que mudou.

### 1.3 Agendado do relatório do Clarity

O Clarity grava como as pessoas usam o site: cliques, rolagem, cliques de raiva e gravações de sessão.

**Opção A: Claude com o conector do Microsoft Clarity** (plano pago)
1. Em **Configurações → Conectores**, adicione **Microsoft Clarity** e entre com sua conta.
2. Teste uma pergunta simples:
   > Quantas sessões o site teve nos últimos 3 dias? E quais páginas foram mais vistas?
3. Quando a resposta estiver boa, transforme em agendado (toda segunda às 8h):
   > Monte o relatório semanal do Clarity do projeto Himal: sessões, usuários, páginas mais vistas, dispositivos, cliques de raiva, cliques mortos e rolagem média. Compare com a semana anterior. Termine com 3 recomendações práticas para o site e o blog. Se algum dado não vier, diga qual e siga com o resto.

**Opção B: gratuita, com a API do Clarity**
1. No Clarity: **Configurações → Exportação de dados → Gerar novo token de API**.
2. A API devolve os dados dos **últimos 1 a 3 dias** e tem limite de **10 chamadas por dia**. Por isso, rode uma vez por dia e guarde o histórico.
3. No Antigravity, peça um script que chame a API e resuma os números. Esse script é a mesma arquitetura do postador, e é uma das [evoluções pós-aula](EVOLUCOES.md).

### 1.4 Agendado de post de blog

O painel do blog (`/admin`) tem o botão **Preencher campos**: você cola a resposta do agendado e ele preenche título, resumo e texto.

**Prompt do agendado** (funciona no Claude, no ChatGPT ou no Antigravity):
> Você é o redator do blog da Himal, café especial do Nepal (site: https://himal-cafe.web.app).
> Toda terça às 7h: pesquise uma notícia ou tendência recente sobre cafés especiais, métodos de preparo ou origem Nepal/Himalaia e escreva um post de 600 a 900 palavras, otimizado para SEO e para buscas por IA (responda a perguntas reais, use subtítulos e uma lista).
> Não invente números nem prêmios. Cite a fonte no final.
> Responda EXATAMENTE neste formato:
> ```
> TÍTULO: ...
> RESUMO: (até 200 caracteres)
> IMAGEM: (link de uma imagem livre, opcional)
> ALT: (descrição da imagem)
> TEXTO:
> (parágrafos; "## " para subtítulo; "- " para lista; **negrito**)
> ```

**Publicar:** abra o painel, cole a resposta em **Colar a resposta do agendador**, clique em **Preencher campos**, revise e clique em **Publicar no blog**.

> Isso é **semiautomático**: a IA escreve e você revisa e publica. A versão 100% automática é uma das [evoluções pós-aula](EVOLUCOES.md).

---

## Parte 2: Arquitetura e primeiras sprints

### 2.1 Como o postador funciona

```
 ┌───────────── GitHub Actions (todo dia ~8h) ─────────────┐
 │                                                          │
 │  Google News ──► Gemini ──► Arte (template) ──► GitHub   │
 │   (pauta)       (texto)     (sem IA, canvas)   (URL da   │
 │                                                 imagem)  │
 └───────────────────────────────┬──────────────────────────┘
                                 ▼
                     Telegram: foto + legenda
                 [✅ Aprovar e publicar] [🔄 Gerar outro]
                                 │ você clica
                                 ▼
                 Instagram API: container ──► publish
                                 │
                                 ▼
                     Telegram: "✅ Publicado! <link>"

 Painel /admin (Firebase) ──► Firestore: marca + templates ──► lido pelo gerador
```

**Por que a arte é sem IA?** Para manter a identidade da marca igual em todos os posts. A IA escolhe as palavras e o template garante cores, fontes e composição.

**Por que aprovar no Telegram?** Porque a IA erra. O humano no meio do processo (*human in the loop*) é o que deixa você dormir tranquilo. Aprovar leva 3 segundos no celular.

**Camadas do sistema:**

| Camada | Peça | O que faz |
|---|---|---|
| Interface | Painel `/admin` (Firebase Hosting) | Você configura marca e templates |
| Dados | Firestore + arquivos JSON no GitHub | Marca, templates, histórico de posts e temas usados |
| Inteligência | Google News + Gemini | Pauta atual + texto no tom da marca |
| Produção | `@napi-rs/canvas` | Desenha a arte 1080×1350 |
| Automação | GitHub Actions | Roda sozinho no horário |
| Aprovação | Telegram Bot API | Rascunho com botões no celular |
| Publicação | Instagram API | Publica e devolve o link |

### 2.2 As peças: GitHub, Google Cloud, Meta e Telegram

**GitHub**
- **Repositório:** a pasta do projeto na nuvem, com todo o histórico de mudanças.
- **Commit:** uma "foto" do projeto com uma mensagem explicando o que mudou.
- **Branch:** uma linha paralela de trabalho. Nesta aula, cada etapa pronta está numa branch (`sprint-0` … `sprint-5`).
- **Actions:** robôs que rodam o seu código em servidores do GitHub, num horário (*cron*) ou quando você clica em **Run workflow**. É gratuito para repositórios públicos.
- **Secrets:** cofre de senhas do repositório. O código usa, mas ninguém consegue ler, nem nos logs.
- **jsDelivr:** CDN gratuito que transforma um arquivo do GitHub em link público. É o que o Instagram precisa para baixar a imagem.

**Google Cloud / Firebase (plano Spark, gratuito)**
- **Projeto:** a "conta" que agrupa tudo no Google Cloud.
- **Hosting:** hospeda o site, o blog e o painel em `https://SEU-PROJETO.web.app`.
- **Authentication:** login do painel (e-mail e senha).
- **Firestore:** banco de dados com posts do blog, marca e templates.
- **Regras do Firestore:** quem pode ler e quem pode escrever. Aqui, qualquer um lê e só o admin escreve.
- **Google AI Studio:** onde nasce a chave do Gemini.
- *Fora do plano gratuito:* Cloud Functions, Storage e Scheduler exigem o plano Blaze, que pede cartão. Por isso usamos o GitHub Actions.

**Meta (Facebook / Instagram)**
- **Conta profissional** do Instagram: exigida para publicar via API.
- **App de desenvolvedor:** a "identidade" do seu robô para a Meta.
- **Testador do Instagram:** em modo de desenvolvimento, o app só publica em contas convidadas como testadoras. É o seu caso, então não precisa de revisão da Meta.
- **Token de acesso:** a senha que autoriza o app a publicar na conta. Vale 60 dias.

**Telegram**
- **@BotFather:** o bot que cria bots. Ele entrega o **token**.
- **Chat ID:** o número da sua conversa com o bot. O postador só obedece a esse chat.
- **Botões inline:** os botões dentro da mensagem (Aprovar / Gerar outro).
- **Polling:** o postador pergunta ao Telegram "tem clique novo?", sem precisar de servidor no ar.

### 2.3 Preparar o projeto

O ponto de partida (`sprint-0`) já tem o site, o blog, o painel do blog e o Clarity. Vamos construir o postador em cima dele.

**1. Baixar o ponto de partida**
```bash
git clone -b sprint-0 https://github.com/matheusborguete/himal-cafe.git himal-ao-vivo
```
```bash
cd himal-ao-vivo
```

**2. Criar o seu repositório no GitHub**
```bash
git checkout -b main
```
```bash
git remote remove origin
```
```bash
gh repo create himal-ao-vivo --public --source . --push
```

**3. Abrir no Claude Code ou no Antigravity.** Abra a pasta `himal-ao-vivo` e peça:
> Leia o CLAUDE.md e me explique a estrutura deste projeto em 5 linhas.

**4. Firebase (opcional para alunos).** Se você fez o passo 10 dos pré-requisitos, já tem o seu projeto. Se não, siga sem o painel: na Sprint 1, os templates ficam em arquivo.

> **Como pedir para a IA, em toda sprint:**
> 1. Diga **o quê** e **para quê**, não só o "como".
> 2. Peça **código simples e comentado**.
> 3. Antes de aceitar, leia o plano dela. No Claude Code, use o **modo de planejamento** (Shift+Tab).
> 4. Teste. Só passe para a próxima sprint quando o critério de **pronto** funcionar.
> 5. Faça commit ao fim de cada sprint: `git add -A`, depois `git commit -m "sprint N"` e `git push`.

---

### Sprint 1: Interface de marca e templates

**Objetivo:** uma tela no painel para configurar o tom da marca e o visual das artes, com prévia ao vivo.

**Prompt para o Claude Code:**
> No painel /admin, crie uma aba "Postador do Instagram" ao lado da aba do blog. Nela eu quero:
> 1. **Marca:** nome, site, descrição, público, tom de voz, o que evitar, chamada para ação, hashtags, pilares de conteúdo (lista) e buscas de notícias (lista).
> 2. **Templates da arte:** criar, duplicar, ativar/desativar e excluir. Cada template tem cores do fundo, da faixa do topo, de duas camadas de montanha, da etiqueta, do título, do texto e da marca.
> 3. **Prévia ao vivo** num canvas de 1080×1350 com uma etiqueta, um título e um texto de exemplo.
>
> Salve no Firestore: `config/marca` e `templates/{nome}`, com leitura pública e escrita só do admin (atualize o firestore.rules).
> O desenho da arte deve ficar num arquivo único, `public/assets/desenho.js`, exportando `desenhar(ctx, conteudo, template, fontes, assinatura)`, porque depois o Node vai usar o mesmo arquivo.
> Use as fontes Fraunces (título) e Inter (texto) e o estilo do himal.css. Código simples, comentado em português. No fim, faça o deploy de hosting e regras.

**Pronto quando:** você entra no `/admin`, muda a cor de um template, vê a prévia mudar e, ao recarregar a página, a cor continua salva.

**Sem Firebase?** Peça:
> Crie `postador/marca.json` e `postador/templates/neve.json`, `gurans.json` e `saanjh.json` com os campos acima, e um `postador/testar-slide.js` que desenhe uma arte de exemplo de cada template em `postador/amostras/`.

---

### Sprint 2: Gerador (pauta + IA + arte)

**Objetivo:** um comando que busca uma pauta atual, escreve o post com IA e desenha a arte.

**1. Guardar a chave do Gemini.** Crie o arquivo `postador/.env` (ele já está no `.gitignore` e nunca vai para o GitHub):
```
GEMINI_API_KEY=cole_aqui_sem_aspas
```
> ⚠️ No telão, não abra o `.env`. Crie e preencha fora da tela compartilhada.

**2. Prompt para o Claude Code:**
> Crie a pasta `postador/` em Node 22, JavaScript puro (ESM), com a única dependência `@napi-rs/canvas`. O comando `npm run gerar` deve:
> 1. Ler a marca e os templates ativos do Firestore pela API REST pública (sem login). Se estiver vazio, use `marca.json` e `templates/*.json`.
> 2. Buscar até 8 manchetes dos últimos 14 dias no Google News RSS, usando uma das "buscas de notícias" da marca.
> 3. Chamar o Gemini pela API REST (chave em `GEMINI_API_KEY`, carregada do `.env`) pedindo resposta em JSON: `tema`, `etiqueta`, `titulo` (até 60 caracteres), `texto` (até 150), `legenda` (400 a 900, terminando com a CTA e as hashtags) e `noticiaUsada`. Passe os últimos 20 temas para não repetir. Use `gemini-flash-latest` com reserva no `gemini-flash-lite-latest`, porque o gratuito às vezes fica sobrecarregado.
> 4. Desenhar a arte com o mesmo `public/assets/desenho.js` do painel, alternando os templates, e salvar em `postador/imagens/<id>.jpg`.
> 5. Guardar o post em `postador/dados/posts.json`.
> Nunca imprima a chave. Código comentado em português.

**3. Rodar:**
```bash
cd postador
```
```bash
npm install
```
```bash
npm run gerar
```

**Pronto quando:** aparece o JSON do post no terminal e a arte em `postador/imagens/`.

**Conversa para a turma:** abra a arte gerada. A IA escreveu o texto e o código desenhou a arte. Pergunte o que mudariam no prompt para o texto ficar mais "a cara" da marca, e ajuste o tom de voz no painel.

---

## Parte 3: Bot, Meta e piloto automático

### Sprint 3: Bot do Telegram

**Objetivo:** o rascunho chega no celular com os botões de aprovar.

**1. Token no `.env`:**
```
TELEGRAM_BOT_TOKEN=cole_aqui
TELEGRAM_CHAT_ID=
```
Deixe o `TELEGRAM_CHAT_ID` vazio por enquanto.

**2. Prompt para o Claude Code:**
> Agora mande o rascunho para o Telegram. O `npm run gerar` deve enviar a arte como foto, com a legenda e dois botões: "✅ Aprovar e publicar" e "🔄 Gerar outro".
> Use **polling** (`getUpdates`), sem webhook e sem servidor:
> - `npm run verificar` olha os cliques uma vez e sai;
> - `npm run escutar` fica ouvindo e reage na hora.
>
> Se `TELEGRAM_CHAT_ID` estiver vazio, o bot responde a quem mandar mensagem com o número do chat. Depois de configurado, ignore qualquer outro chat.
> "Gerar outro" descarta e gera um novo. O comando `/gerar` cria um post na hora. Por enquanto, "Aprovar" só marca o post como aprovado.
> Guarde o `offset` do Telegram em `postador/dados/telegram.json`.

**3. Descobrir o seu chat ID:** mande **oi** para o bot e rode:
```bash
npm run verificar
```
O bot responde no Telegram com o seu número. Cole em `TELEGRAM_CHAT_ID=` no `.env`.

**4. Testar:**
```bash
npm run gerar
```
```bash
npm run escutar
```

**Pronto quando:** o rascunho chega no seu celular, o **Gerar outro** traz um post novo e o **Aprovar** responde "Aprovado".

---

### Sprint 4: Publicar no Instagram

**Objetivo:** clicar em Aprovar publica no Instagram e devolve o link.

**1. Criar o app na Meta** (só o professor faz ao vivo; os alunos acompanham)
1. Em https://developers.facebook.com: **Meus apps → Criar app**.
2. Nome: `Postador Himal ao vivo`. Caso de uso: **Gerenciar mensagens e conteúdo no Instagram**. Não precisa vincular portfólio empresarial.
3. No painel do app: **Instagram → Configuração da API com login do Instagram**.
4. Em **Funções do app → Funções → Adicionar pessoas → Testador do Instagram**, digite o @ da conta da marca.
5. Aceite o convite **no Instagram**: **Configurações → Permissões de sites e apps → Apps e sites → Convites de testador → Aceitar**. Pelo computador, use instagram.com → Configurações → Apps e sites.
6. Volte em **Gerar tokens de acesso → Adicionar conta**, entre com a conta da marca, autorize e copie o token.
7. No `.env`:
   ```
   IG_TOKEN=cole_aqui
   ```

> O app fica em **modo de desenvolvimento**. Para publicar na própria conta, não precisa de revisão da Meta.
> O token vale **60 dias**. Anote na agenda para gerar outro (ou faça a evolução de renovação automática).

**2. Prompt para o Claude Code:**
> Ao clicar em Aprovar, publique no Instagram pela **Instagram API com login do Instagram** (`graph.instagram.com`, versão v23.0, token em `IG_TOKEN`):
> 1. Descubra o id da conta com `/me`.
> 2. Crie o container com `image_url` e `caption`.
> 3. Espere o container ficar `FINISHED`.
> 4. Publique com `/media_publish`, pegue o `permalink` e mande "✅ Publicado! <link>" no Telegram.
>
> O Instagram precisa de uma **URL pública** da imagem. Faça commit e push da imagem para o GitHub e use o jsDelivr fixado no commit (`https://cdn.jsdelivr.net/gh/<dono>/<repo>@<sha>/postador/imagens/<id>.jpg`). Salve o estado (status, link) no `posts.json`.
> Repita a chamada em erros temporários da API. Nunca imprima o token.

**3. Testar:**
```bash
npm run gerar
```
```bash
npm run escutar
```
Aprove no celular e veja o post aparecer no Instagram. 🎉

**Pronto quando:** o Telegram responde com o link do post publicado.

---

### Sprint 5: Piloto automático no GitHub Actions

**Objetivo:** gerar todo dia às ~8h sem o computador ligado, e publicar na hora da aprovação.

**Prompt para o Claude Code:**
> Crie dois workflows do GitHub Actions para o postador:
> 1. `postador-gerar.yml`: todo dia às 10h40 UTC (7h40 em Brasília; o GitHub costuma atrasar de 10 a 30 min) e com botão manual. Ele roda `node gerar.js` e depois `node escutar.js --minutos=240`, para publicar na hora se eu aprovar nas 4 horas seguintes.
> 2. `postador-verificar.yml`: a cada 10 minutos, `node verificar.js`, como rede de segurança.
>
> Os dois com `concurrency: postador` (nunca rodam juntos), `permissions: contents: write`, Node 22, `npm ci` e o git configurado com um usuário de robô. As chaves vêm dos Secrets do repositório.

**Enviar as chaves para os Secrets** (sem mostrar na tela):
```bash
gh secret set -f postador/.env
```

**Testar agora:** no GitHub, abra **Actions → Postador: gerar post → Run workflow**. O rascunho chega em ~1 minuto. Aprove e veja publicar.

**Pronto quando:** o workflow manual gera, você aprova e o post sai, sem nada rodando no seu computador.

> **Atenção:** o GitHub não garante o horário exato dos agendamentos. Em horários de pico, ele pode atrasar ou pular execuções. Por isso o "gerar" fica 4 horas ouvindo os cliques.

---

### Se sobrar tempo: evoluções

Detalhes e prompts em [EVOLUCOES.md](EVOLUCOES.md):
1. **Carrossel** de 3 a 5 lâminas (capa, conteúdo, CTA).
2. **Blog automático**: o mesmo fluxo, com aprovação no Telegram e publicação no blog.
3. **Relatório do Clarity no Telegram**, com a mesma arquitetura.

---

## Checkpoints: se travar, pule para a etapa pronta

Cada etapa pronta está numa branch do repositório da aula:

| Branch | O que já tem |
|---|---|
| `sprint-0` | Site, blog, painel do blog e Clarity (ponto de partida) |
| `sprint-1` | + aba do postador no painel (marca, templates e prévia) |
| `sprint-2` | + `npm run gerar` (pauta, Gemini e arte no computador) |
| `sprint-3` | + bot do Telegram com Aprovar / Gerar outro |
| `sprint-4` | + publicação no Instagram (rodando no computador) |
| `sprint-5` | + GitHub Actions (projeto completo) |

**Para baixar uma etapa pronta** (troque `sprint-3` pela que você quer):
```bash
git clone -b sprint-3 https://github.com/matheusborguete/himal-cafe.git himal-sprint-3
```
Depois, copie o seu `postador/.env` para a nova pasta e rode `npm install` dentro de `postador/`.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `Gemini 402 ... prepayment credits are depleted` | Chave criada num projeto com faturamento | Crie a chave num projeto **sem faturamento** no AI Studio |
| `Gemini 503 ... overloaded` | Plano gratuito congestionado | Espere 1 minuto ou deixe o código cair para o modelo reserva |
| `Gemini 404 ... no longer available` | Modelo antigo desativado | Use `gemini-flash-latest` |
| O bot não responde | Token errado ou nenhum "oi" enviado | Confira o `TELEGRAM_BOT_TOKEN` e mande **oi** para o bot |
| O rascunho chegou no celular, mas não no Telegram Web | O Telegram Web às vezes não atualiza sozinho | Recarregue a página ou use o app do celular ou o Telegram Desktop |
| O workflow demora para mandar o rascunho | O Gemini gratuito está sobrecarregado | O código troca para o modelo reserva sozinho. Normalmente leva menos de 1 minuto |
| "Esse rascunho já foi resolvido" | Clique duplo ou rascunho antigo | Gere outro com `/gerar` |
| Instagram `(#10) ... not allowed` ou sem permissão | Convite de testador não aceito | Aceite no Instagram: Apps e sites → Convites de testador |
| Instagram `Invalid OAuth access token` | Token vencido (60 dias) ou copiado pela metade | Gere outro token no painel da Meta |
| Instagram não baixa a imagem | URL não pública | Confira se o repositório é **público** e se o push foi feito |
| Aprovei e nada aconteceu | Ninguém estava ouvindo | Rode `npm run escutar` ou o workflow manual |
| `git push` recusado com `workflow` | O login do GitHub sem permissão de workflows | Rode `gh auth refresh -h github.com -s workflow` |
| `firebase: command not found` | Firebase CLI não instalado | Rode `npm install -g firebase-tools` |

---

## Segurança

- **Chaves e tokens são senhas.** Ficam no `postador/.env` (fora do Git) e nos **Secrets** do GitHub. O GitHub mascara os Secrets nos logs (`***`).
- **Nunca** cole uma chave no chat, no prompt da IA, num print ou no código.
- A `apiKey` do Firebase em `firebase.js` **é pública por design**. Quem protege os dados são as **regras do Firestore**.
- O bot só obedece ao **seu** chat ID.
- **Depois da aula:** se você mostrou algo sem querer, revogue. Use `/revoke` no BotFather, apague a chave no AI Studio e remova o app ou gere outro token na Meta.
