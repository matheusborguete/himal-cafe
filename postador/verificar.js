// PASSO 2 — Confere se você clicou em Aprovar / Gerar outro no Telegram.
// Uso: npm run verificar   (no GitHub Actions roda sozinho a cada 10 minutos)
import { processarNovidades } from "./lib/bot.js";

const n = await processarNovidades(0);
console.log(n ? `${n} novidade(s) tratada(s)` : "Nada novo no Telegram");
