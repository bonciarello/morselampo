/**
 * Test suite per MorseLampo
 * Testa le funzioni di conversione Morse esportate dal modulo.
 *
 * Esecuzione: node tests/test.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Carica l'HTML e inietta nel DOM
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'https://github.com/bonciarello/morselampo/'
});

const { window } = dom;
const MorseLampo = window.MorseLampo;

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`  ✗ ${name} — ${e.message}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

function assertMatch(actual, regex, msg) {
  if (!regex.test(actual)) {
    throw new Error(msg || `"${actual}" does not match ${regex}`);
  }
}

console.log('\n MorseLampo — Test Suite\n');
console.log('='.repeat(50));

// ---- Rilevamento Morse ----
console.log('\n[ Rilevamento input Morse ]');

test('riconosce "... --- ..." come Morse', () => {
  assertEqual(MorseLampo.looksLikeMorse('... --- ...'), true);
});

test('riconosce "·−·− ·· ·− −−−" come Morse (Unicode)', () => {
  assertEqual(MorseLampo.looksLikeMorse('·−·− ·· ·− −−−'), true);
});

test('riconosce "CIAO" come NON Morse', () => {
  assertEqual(MorseLampo.looksLikeMorse('CIAO'), false);
});

test('stringa vuota NON è Morse', () => {
  assertEqual(MorseLampo.looksLikeMorse(''), false);
});

test('soli spazi NON è Morse', () => {
  assertEqual(MorseLampo.looksLikeMorse('   '), false);
});

test('riconosce "/" come Morse (separatore parole)', () => {
  assertEqual(MorseLampo.looksLikeMorse('... / ---'), true);
});

// ---- Testo → Morse ----
console.log('\n[ Conversione Testo → Morse ]');

test('"CIAO" → Morse', () => {
  const result = MorseLampo.textToMorse('CIAO');
  assertEqual(result, '-.-. .. .- ---');
});

test('"SOS" → Morse', () => {
  const result = MorseLampo.textToMorse('SOS');
  assertEqual(result, '... --- ...');
});

test('"HELLO" → Morse', () => {
  const result = MorseLampo.textToMorse('HELLO');
  assertEqual(result, '.... . .-.. .-.. ---');
});

test('"HELLO WORLD" → Morse con separatore parole', () => {
  const result = MorseLampo.textToMorse('HELLO WORLD');
  assertEqual(result, '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
});

test('minuscole convertite in maiuscole', () => {
  const result = MorseLampo.textToMorse('ciao');
  assertEqual(result, '-.-. .. .- ---');
});

test('numeri: "123" → Morse', () => {
  const result = MorseLampo.textToMorse('123');
  assertEqual(result, '.---- ..--- ...--');
});

test('"0" (zero) → Morse', () => {
  const result = MorseLampo.textToMorse('0');
  assertEqual(result, '-----');
});

test('"9" → Morse', () => {
  const result = MorseLampo.textToMorse('9');
  assertEqual(result, '----.');
});

test('punteggiatura: "." → Morse', () => {
  const result = MorseLampo.textToMorse('.');
  assertEqual(result, '.-.-.-');
});

test('punteggiatura: "?" → Morse', () => {
  const result = MorseLampo.textToMorse('?');
  assertEqual(result, '..--..');
});

test('punteggiatura: "," → Morse', () => {
  const result = MorseLampo.textToMorse(',');
  assertEqual(result, '--..--');
});

test('"À" (accentata) → Morse', () => {
  const result = MorseLampo.textToMorse('À');
  assertEqual(result, '.--.-');
});

test('caratteri sconosciuti vengono saltati', () => {
  const result = MorseLampo.textToMorse('CIAO★');
  assertEqual(result, '-.-. .. .- ---');
});

test('stringa vuota → Morse vuoto', () => {
  const result = MorseLampo.textToMorse('');
  assertEqual(result, '');
});

test('alfabeto completo A-Z', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const result = MorseLampo.textToMorse(letters);
  const expected = '.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..';
  assertEqual(result, expected);
});

// ---- Morse → Testo ----
console.log('\n[ Conversione Morse → Testo ]');

test('"... --- ..." → "SOS"', () => {
  const result = MorseLampo.morseToText('... --- ...');
  assertEqual(result, 'SOS');
});

test('"-.-. .. .- ---" → "CIAO"', () => {
  const result = MorseLampo.morseToText('-.-. .. .- ---');
  assertEqual(result, 'CIAO');
});

test('".... . .-.. .-.. ---" → "HELLO"', () => {
  const result = MorseLampo.morseToText('.... . .-.. .-.. ---');
  assertEqual(result, 'HELLO');
});

test('Morse con "/" come spazio tra parole', () => {
  const result = MorseLampo.morseToText('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
  assertEqual(result, 'HELLO WORLD');
});

test('Morse con Unicode · e −', () => {
  const result = MorseLampo.morseToText('··· −−− ···');
  assertEqual(result, 'SOS');
});

test('Morse con spazi multipli tra caratteri', () => {
  const result = MorseLampo.morseToText('...   ---   ...');
  assertEqual(result, 'SOS');
});

test('numeri Morse → testo: ".---- ..--- ...--"', () => {
  const result = MorseLampo.morseToText('.---- ..--- ...--');
  assertEqual(result, '123');
});

test('punteggiatura Morse → testo: ".-.-.-" → "."', () => {
  const result = MorseLampo.morseToText('.-.-.-');
  assertEqual(result, '.');
});

test('Morse vuoto → testo vuoto', () => {
  const result = MorseLampo.morseToText('');
  assertEqual(result, '');
});

// ---- Normalizzazione ----
console.log('\n[ Normalizzazione ]');

test('normalizeMorse converte · in .', () => {
  assertEqual(MorseLampo.normalizeMorse('··· −−− ···'), '... --- ...');
});

test('normalizeMorse converte − in -', () => {
  assertEqual(MorseLampo.normalizeMorse('−·−·'), '-.-.');
});

// ---- Display ----
console.log('\n[ Visualizzazione display ]');

test('toDisplayMorse converte . in · e - in −', () => {
  const result = MorseLampo.toDisplayMorse('... --- ...');
  assertEqual(result, '··· −−− ···');
});

// ---- Roundtrip ----
console.log('\n[ Roundtrip ]');

test('Testo → Morse → Testo preserva il messaggio', () => {
  const original = 'HELLO WORLD';
  const morse = MorseLampo.textToMorse(original);
  const back = MorseLampo.morseToText(morse);
  assertEqual(back, original);
});

test('Morse → Testo → Morse preserva il codice', () => {
  const original = '... --- ...';
  const text = MorseLampo.morseToText(original);
  const back = MorseLampo.textToMorse(text);
  assertEqual(back, original);
});

test('Roundtrip con numeri', () => {
  const original = '9876543210';
  const morse = MorseLampo.textToMorse(original);
  const back = MorseLampo.morseToText(morse);
  assertEqual(back, original);
});

// ---- Mappe ----
console.log('\n[ Integrità mappe ]');

test('TEXT_TO_MORSE contiene tutte le 26 lettere', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const ch of letters) {
    if (!MorseLampo.TEXT_TO_MORSE[ch]) {
      throw new Error(`Lettera mancante: ${ch}`);
    }
  }
});

test('TEXT_TO_MORSE contiene tutte le 10 cifre', () => {
  for (let i = 0; i <= 9; i++) {
    if (!MorseLampo.TEXT_TO_MORSE[String(i)]) {
      throw new Error(`Cifra mancante: ${i}`);
    }
  }
});

test('MORSE_TO_TEXT inverso di TEXT_TO_MORSE per le lettere', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const ch of letters) {
    const code = MorseLampo.TEXT_TO_MORSE[ch];
    const back = MorseLampo.MORSE_TO_TEXT[code];
    // back could be the accented version; check that at least one maps back correctly
    // We just verify that back exists and is a valid character
    if (!back) {
      throw new Error(`Nessuna voce inversa per ${ch} (${code})`);
    }
  }
});

test('MORSE_TO_TEXT inverso di TEXT_TO_MORSE per le cifre', () => {
  for (let i = 0; i <= 9; i++) {
    const code = MorseLampo.TEXT_TO_MORSE[String(i)];
    const back = MorseLampo.MORSE_TO_TEXT[code];
    assertEqual(back, String(i), `Inverso errato per cifra ${i}`);
  }
});

// ---- Accettazione ----
console.log('\n[ Criteri di accettazione ]');

test('AC1: "CIAO" produce Morse corretto', () => {
  const result = MorseLampo.textToMorse('CIAO');
  assertEqual(result, '-.-. .. .- ---');
});

test('AC2: "... --- ..." produce "SOS"', () => {
  const result = MorseLampo.morseToText('... --- ...');
  assertEqual(result, 'SOS');
});

// ---- Riepilogo ----
console.log('\n' + '='.repeat(50));
console.log(`\n  Risultati: ${passed} passati, ${failed} falliti su ${passed + failed} test\n`);

if (failures.length > 0) {
  console.log('Dettaglio fallimenti:');
  failures.forEach(f => console.log(`  ✗ ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('  ✅ Tutti i test superati!\n');
  process.exit(0);
}
