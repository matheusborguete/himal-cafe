# Himal Café: site, blog e painel

Projeto didático da aula "Automação com IA" (curso de IA aplicada ao Marketing).
Site da Himal (cafés especiais do Nepal) com um blog e uma área logada para publicar posts.

- Produção: https://himal-cafe.web.app
- Blog: `/blog/` · Post: `/blog/<slug>` · Painel: `/admin`
- Projeto GCP/Firebase: `himal-cafe` (plano **Spark, gratuito, sem cartão**)

## Arquitetura

```
public/
  index.html          landing page (estática)
  blog/index.html     lista de posts (lê o Firestore no navegador)
  blog/post.html      página única para todos os posts (rewrite /blog/** no firebase.json)
  admin/index.html    login (Firebase Auth, e-mail e senha) + formulário de publicação
  assets/firebase.js  configuração do Firebase + utilitários (markdown simples, datas)
  assets/himal.css    identidade visual (cores, fontes) do blog e do painel
firestore.rules       leitura pública; escrita só para o e-mail do admin
```

- Sem build, sem framework: HTML + JavaScript puro com o SDK do Firebase via CDN.
- Coleção `posts/{slug}`: `titulo`, `resumo`, `conteudo` (markdown simples), `imagem` (data URL JPEG ou link), `imagemAlt`, `criadoEm`.
- A foto é reduzida no navegador e guardada no próprio documento (até ~700 KB), porque o Cloud Storage exige o plano Blaze (com cartão).
- Login: o usuário digita `admin-himal` e o painel completa com `@himal-cafe.web.app`.

## Postador do Instagram (`postador/`)

Node 22, JavaScript puro (ESM). Roda no GitHub Actions (gratuito em repositório público).
Gera um post (Google News + Gemini + arte em canvas a partir de `templates/*.json`), manda para o Telegram com botões
Aprovar/Gerar outro e publica pela API do Instagram: token `EAA…` (apps novos, login unificado) usa `graph.facebook.com` + `IG_USER_ID`;
token `IGAA…` (apps antigos) usa `graph.instagram.com`. Lógica em `postador/lib/instagram.js`.
Estado em `postador/dados/*.json`, imagens em `postador/imagens/`, servidas pelo jsDelivr fixado no commit.
Marca e templates: editados no painel (`public/admin/postador.js`) e salvos no Firestore (`config/marca`, `templates/{nome}`,
leitura pública). O postador lê via REST (`postador/lib/config.js`) e cai para `marca.json`/`templates/*.json` se estiver vazio.
O desenho da arte é um só arquivo, `public/assets/desenho.js`, usado na prévia do navegador e no Node (`@napi-rs/canvas`).
Workflows: `.github/workflows/postador-gerar.yml` (diário) e `postador-verificar.yml` (a cada 10 min).
Ao vivo: `npm run escutar` publica na hora. Detalhes e setup das contas: [postador/README.md](postador/README.md).
Segredos: `postador/.env` (fora do git) e Secrets do GitHub (`gh secret set -f postador/.env`). Nunca imprimir tokens.

## Regras para mexer no código

- Código simples e comentado em português: é material de aula.
- Não adicionar nada que exija o plano Blaze (Cloud Functions, Storage, Scheduler) sem combinar antes.
- Nunca colocar senhas no repositório. A `apiKey` em `firebase.js` é pública por design; a segurança está em `firestore.rules`.
- Deploy: `firebase deploy --only hosting,firestore:rules`

---

## Como criar a sua cópia (instruções para a IA)

> Para o aluno: abra este repositório no Claude Code e peça
> "Siga o CLAUDE.md e crie a minha cópia deste projeto no meu Google Cloud".

Pré-requisitos na máquina: Node.js, `git`, Firebase CLI (`npm i -g firebase-tools`) e uma conta Google.
Tudo abaixo cabe no plano gratuito (Spark), sem cartão.

**Passo a passo para a IA executar** (troque `MEU-PROJETO` por um ID único, ex.: `cafe-joana-2026`):

1. Login: `firebase login` (o usuário confirma no navegador).
2. Criar o projeto: `firebase projects:create MEU-PROJETO --display-name "Meu Café"`.
   Se o ID já existir, tente outro.
3. Criar o app web e pegar a configuração:
   `firebase apps:create WEB "Site" --project MEU-PROJETO`
   `firebase apps:sdkconfig WEB --project MEU-PROJETO`
   Copie `apiKey`, `authDomain`, `projectId` e `appId` para `public/assets/firebase.js`.
4. Criar o banco Firestore:
   `firebase firestore:databases:create "(default)" --location southamerica-east1 --project MEU-PROJETO`
   (ou, com o gcloud: `gcloud firestore databases create --location=southamerica-east1 --project MEU-PROJETO`).
5. **Passo manual (o usuário faz, ~1 min):** no console do Firebase
   (`https://console.firebase.google.com/project/MEU-PROJETO/authentication`):
   - clicar em **Vamos começar** → **E-mail/senha** → ativar → Salvar;
   - aba **Users** → **Adicionar usuário** → e-mail `admin@MEU-PROJETO.web.app` e uma senha.
   A IA não deve escolher nem digitar a senha: quem cria é o usuário.
6. Trocar o domínio do admin em dois lugares:
   - `firestore.rules`: o e-mail em `ehAdmin()`;
   - `public/admin/index.html`: a constante `DOMINIO`.
7. Trocar `himal-cafe` por `MEU-PROJETO` em `.firebaserc` e nas URLs (`index.html`, `blog/*.html`).
8. Publicar: `firebase deploy --only hosting,firestore:rules`.
9. Testar: abrir `https://MEU-PROJETO.web.app/admin`, entrar e publicar um post.

## Formato que o agendado (Claude/ChatGPT) deve devolver

O painel tem o botão **Preencher campos**, que entende este formato:

```
TÍTULO: Como moer café em casa sem perder o aroma
RESUMO: Uma frase de até 200 caracteres para o Google e para a lista do blog.
IMAGEM: https://link-da-imagem.jpg   (opcional)
ALT: descrição da imagem             (opcional)
TEXTO:
Primeiro parágrafo...

## Subtítulo

- item de lista
- outro item
```
