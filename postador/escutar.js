// MODO AO VIVO — deixa o bot ouvindo o Telegram no seu computador.
// Clicou em Aprovar, publica na hora (sem esperar o GitHub Actions).
// Uso: npm run escutar    (Ctrl+C para parar)
import { processarNovidades } from "./lib/bot.js";

console.log("Bot ouvindo o Telegram… (Ctrl+C para parar)");
while (true) {
  try {
    await processarNovidades(25); // espera até 25 s por um clique
  } catch (e) {
    console.error(e.message);
    await new Promise((r) => setTimeout(r, 5000));
  }
}
