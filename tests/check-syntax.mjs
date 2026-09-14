// Minimalna weryfikacja z dokumentacji: wycina skrypt z demorecorder.html
// i sprawdza jego składnię (node --check w wersji programowej).
import { readAppScript, assertScriptParses } from "./helpers.mjs";

const script = await readAppScript();
assertScriptParses(script);
console.log("składnia JS OK — demorecorder.html");
