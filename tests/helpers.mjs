// Wspólne helpery testów: wycinają z demorecorder.html blok czystej logiki
// (CYBERPLAYER-CORE) i udostępniają go Node bez przeglądarki i bez build systemu.
import { readFile } from "node:fs/promises";
import vm from "node:vm";

export const ROOT = new URL("..", import.meta.url);
export const HTML_PATH = new URL("demorecorder.html", ROOT);
const CORE_START = "/* CYBERPLAYER-CORE-START";
const CORE_END = "/* CYBERPLAYER-CORE-END */";

export async function readHtml() {
  return readFile(HTML_PATH, "utf8");
}

export async function readCoreSource() {
  const html = await readHtml();
  const start = html.indexOf(CORE_START);
  const end = html.indexOf(CORE_END);
  if (start < 0 || end < 0) {
    throw new Error("Nie znaleziono bloku CYBERPLAYER-CORE w demorecorder.html");
  }
  return html.slice(start, end + CORE_END.length);
}

export async function loadCore() {
  const source = await readCoreSource();
  const factory = new Function(`${source}\nreturn CyberCore;`);
  return factory();
}

export async function readAppScript() {
  const html = await readHtml();
  const chunks = html.split("<script>");
  if (chunks.length < 2) throw new Error("Brak bloku <script> w demorecorder.html");
  return chunks[1].split("</script>")[0];
}

export function assertScriptParses(script) {
  new vm.Script(script, { filename: "demorecorder.html" });
}

export function fakeFile(name, type = "") {
  return { name, type };
}
