# Evoluções do postador: bônus da aula e tarefas pós-aula

Cada evolução reaproveita a mesma arquitetura (gerar → aprovar no Telegram → publicar). Elas estão em ordem de dificuldade.
Para cada uma: **objetivo**, **prompt para o Claude Code / Antigravity** e **pronto quando**.

---

## Bônus na aula (se sobrar tempo)

### 1. Carrossel no Instagram ⭐⭐
Carrossel costuma gerar mais salvamentos e compartilhamentos que a imagem única.

**Prompt:**
> Adicione a opção de carrossel ao postador. O Gemini passa a devolver também `laminas`: uma lista de 3 a 5 itens `{titulo, texto}`.
> Desenhe uma capa (template atual), as lâminas de conteúdo (mesmo template, numeradas "2/5") e uma última lâmina com a CTA e o @ da marca.
> No Telegram, mande o rascunho como álbum (`sendMediaGroup`) e, em seguida, a mensagem com os botões.
> Na publicação, crie um container para cada imagem com `is_carousel_item=true`, depois o container `media_type=CAROUSEL` com `children` e a `caption`, e publique.
> Na aba do postador do painel, adicione a escolha "imagem única ou carrossel".

**Pronto quando:** o carrossel aparece no Instagram com todas as lâminas na ordem.

### 2. Blog 100% automático, com aprovação no Telegram ⭐⭐⭐
Hoje o agendado escreve e você cola no painel. Aqui, o robô escreve, você aprova no Telegram e ele publica no blog.

**Prompt:**
> Crie `postador/blog.js`: escreva um post de blog com o Gemini (600 a 900 palavras, SEO e GEO, com subtítulos e lista) a partir de uma pauta do Google News, no formato do Firestore `posts/{slug}` (titulo, resumo, conteudo, imagemAlt, criadoEm).
> Mande para o Telegram: título, resumo e as 3 primeiras linhas, com os botões "✅ Publicar no blog" e "🔄 Outro".
> Para gravar no Firestore com as regras atuais, faça login como admin pela API REST do Firebase Auth (`signInWithPassword`), com `ADMIN_EMAIL` e `ADMIN_SENHA` nos Secrets, e use o token no `Authorization` da API REST do Firestore.
> Agende no GitHub Actions toda terça às 7h. Nunca imprima a senha nem o token.

**Pronto quando:** o post aparece em `/blog/` depois do clique no Telegram.

### 3. Relatório do Clarity no Telegram ⭐⭐
É a mesma arquitetura com outra fonte de dados.

**Prompt:**
> Crie `postador/clarity.js`: chame a Clarity Data Export API (`https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1`, com `Authorization: Bearer CLARITY_TOKEN`), resuma com o Gemini (sessões, usuários, páginas, dispositivos, cliques de raiva, rolagem e 3 recomendações) e mande no Telegram.
> Guarde o resultado de cada dia em `postador/dados/clarity/AAAA-MM-DD.json` para comparar com a semana anterior, porque a API só devolve de 1 a 3 dias e permite 10 chamadas por dia.
> Agende no GitHub Actions todo dia às 8h30.

**Pronto quando:** o resumo chega no Telegram todo dia.

---

## Tarefas pós-aula

### 4. Editar a legenda pelo Telegram ⭐
> Adicione um botão "✏️ Editar" ao rascunho. Quando eu responder à mensagem do rascunho com um texto novo, ele substitui a legenda e o bot manda o rascunho atualizado com os botões de novo.

### 5. Agendar o horário da publicação ⭐⭐
> Ao aprovar, ofereça os botões "Agora", "Hoje 12h" e "Hoje 18h". Os posts agendados ficam com status `agendado` e um `publicarEm`. O `verificar.js` publica os que já passaram do horário.

Lembre que o GitHub pode atrasar o cron em alguns minutos.

### 6. Renovar o token do Instagram sozinho ⭐
> Crie um workflow mensal que chama `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=...` e atualiza o secret `IG_TOKEN` com `gh secret set`. Use um token pessoal do GitHub (`GH_PAT`, com permissão de secrets) guardado como secret. Avise no Telegram quando renovar.

### 7. Métricas do post no Telegram ⭐⭐
> 24 horas depois de publicar, busque os insights do post (`/{media-id}/insights`: alcance, curtidas, comentários, salvamentos e compartilhamentos) e mande no Telegram. Guarde no `posts.json`, para o Gemini aprender quais temas funcionam melhor.

### 8. A IA aprende com os melhores posts ⭐⭐⭐
> No prompt do Gemini, inclua os 5 posts com mais salvamentos e os 5 com menos, e peça para seguir o estilo dos melhores. Mostre no painel um ranking dos temas.

### 9. Stories e Reels ⭐⭐⭐
> Crie um template vertical 1080×1920 para Stories (`media_type=STORIES`). Para Reels, gere um vídeo curto a partir das lâminas do carrossel com o ffmpeg e publique com `media_type=REELS`.

### 10. Várias marcas ⭐⭐⭐
> Transforme o postador em multimarca: cada marca tem o seu documento no Firestore (`marcas/{id}`), os seus templates, o seu chat do Telegram e o seu token do Instagram (nos Secrets, como `IG_TOKEN_<MARCA>`). O workflow roda uma vez para cada marca.

---

## Dica para todas as evoluções
1. Crie uma branch antes de começar:
   ```bash
   git checkout -b evolucao-carrossel
   ```
2. Peça para a IA **planejar antes** de escrever o código.
3. Teste no computador (`npm run gerar` + `npm run escutar`) antes de mandar para o GitHub Actions.
4. Só junte com a `main` quando o critério de **pronto** funcionar.
