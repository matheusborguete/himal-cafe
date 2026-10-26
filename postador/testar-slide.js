// Gera uma arte de exemplo com cada template, sem precisar de nenhuma chave.
// Uso: npm run slide   →  arquivos em ./amostras
import { mkdirSync, writeFileSync } from "node:fs";
import { desenharSlide, listarTemplates } from "./lib/slide.js";

mkdirSync("amostras", { recursive: true });

for (const template of listarTemplates()) {
  const jpg = desenharSlide({
    etiqueta: "Ritual · Nº 02 Gurans",
    titulo: "Moa na hora e a nota de morango aparece.",
    texto: "O aroma do café começa a se perder minutos depois da moagem. Grão inteiro até o último instante.",
    template,
  });
  writeFileSync(`amostras/${template.nome}.jpg`, jpg);
  console.log(`amostras/${template.nome}.jpg`);
}
