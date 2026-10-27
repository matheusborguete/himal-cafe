// MODO AO VIVO — deixa o bot ouvindo o Telegram.
// Clicou em Aprovar, publica na hora (sem esperar o agendamento do GitHub).
// Uso: npm run escutar                 (até você apertar Ctrl+C)
//      node escutar.js --minutos=240   (para sozinho depois de 4 horas)
//
// No GitHub Actions, o workflow "gerar" roda este modo por algumas horas
// depois de mandar o rascunho, para a aprovação ser publicada na hora.
import { processarNovidades } from "./lib/bot.js";

const minutos = Number(process.argv.find((a) => a.startsWith("--minutos="))?.split("=")[1]) || Infinity;
const fim = Date.now() + minutos * 60_000;

console.log(minutos === Infinity ? "Bot ouvindo o Telegram… (Ctrl+C para parar)" : `Bot ouvindo o Telegram por ${minutos} min…`);
while (Date.now() < fim) {
  try {
    await processarNovidades(25); // espera até 25 s por um clique
  } catch (e) {
    console.error(e.message);
    await new Promise((r) => setTimeout(r, 5000));
  }
}
console.log("Tempo de escuta encerrado.");
