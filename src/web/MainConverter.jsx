import React, { useState, useMemo } from 'react';
import { Copy, Check, Globe } from 'lucide-react';
import { jsonToToon, toonToJson } from '../core/toonConverter';
import { estimateTokens } from '../core/tokens';

const t = {
  en: {
    title: 'TOON Converter',
    subtitle: 'Convert between JSON and TOON, calculate token savings',
    jsonToToon: 'JSON → TOON',
    toonToJson: 'TOON → JSON',
    inputLabel: 'Input JSON',
    inputLabelToon: 'Input TOON',
    outputLabel: 'Output TOON',
    outputLabelJson: 'Output JSON',
    examplePeople: 'Example 1: People',
    exampleProducts: 'Example 2: Products',
    clear: 'Clear',
    calculator: 'Token Calculator',
    warning:
      'TOON works best with tabular arrays (uniform data in rows). It also supports nested objects, scalar arrays, and object arrays (schema when homogeneous, JSON lines when heterogeneous).',
    tokensJson: 'JSON Tokens',
    tokensToon: 'TOON Tokens',
    savings: 'Savings',
    difference: 'Difference',
    ratio: 'Ratio',
    sizeJson: 'JSON Size',
    sizeToon: 'TOON Size',
    why: 'Why does TOON save tokens?',
    whyText:
      'TOON eliminates redundancy by declaring structures succinctly: objects use indentation, scalar arrays are inline, homogeneous object arrays declare a schema + data rows, and heterogeneous arrays use compact JSON lines.',
    tip: 'Token estimate is approximate (1 token ≈ 4 characters).',
    copy: 'Copy to clipboard',
  },
  pt: {
    title: 'Conversor TOON',
    subtitle: 'Converte entre JSON e TOON e calcula a poupança de tokens',
    jsonToToon: 'JSON → TOON',
    toonToJson: 'TOON → JSON',
    inputLabel: 'JSON de entrada',
    inputLabelToon: 'TOON de entrada',
    outputLabel: 'TOON de saída',
    outputLabelJson: 'JSON de saída',
    examplePeople: 'Exemplo 1: Pessoas',
    exampleProducts: 'Exemplo 2: Produtos',
    clear: 'Limpar',
    calculator: 'Calculadora de Tokens',
    warning:
      'O TOON funciona melhor com arrays tabulares (dados uniformes por linha). Também suporta objetos aninhados, arrays de escalares e arrays de objetos (schema quando homogéneos, linhas JSON quando heterogéneos).',
    tokensJson: 'Tokens JSON',
    tokensToon: 'Tokens TOON',
    savings: 'Poupança',
    difference: 'Diferença',
    ratio: 'Razão',
    sizeJson: 'Tamanho JSON',
    sizeToon: 'Tamanho TOON',
    why: 'Porque é que o TOON poupa tokens?',
    whyText:
      'O TOON elimina redundância ao declarar a estrutura de forma sucinta: objetos por indentação, arrays de escalares inline, arrays de objetos homogéneos com schema + linhas de dados e arrays heterogéneos com linhas JSON compactas.',
    tip: 'A estimativa de tokens é aproximada (1 token ≈ 4 caracteres).',
    copy: 'Copiar para a área de transferência',
  },
};

export default function MainsConverter() {
  const [input, setInput] = useState(`{
  "context": {
    "task": "Our favorite hikes together",
    "location": "Boulder",
    "season": "spring_2025"
  },
  "friends": ["ana", "luis", "sam"],
  "hikes": [
    {
      "id": 1,
      "name": "Blue Lake Trail",
      "distanceKm": 7.5,
      "elevationGain": 320,
      "companion": "ana",
      "wasSunny": true
    },
    {
      "id": 2,
      "name": "Ridge Overlook",
      "distanceKm": 9.2,
      "elevationGain": 540,
      "companion": "luis",
      "wasSunny": false
    },
    {
      "id": 3,
      "name": "Wildflower Loop",
      "distanceKm": 5.1,
      "elevationGain": 180,
      "companion": "sam",
      "wasSunny": true
    }
  ]
}`);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('json-to-toon');
  const [lang, setLang] = useState('en');

  const strings = t[lang];

  const output = useMemo(() => {
    if (activeTab === 'json-to-toon') {
    let res = jsonToToon(input, lang);
      return res.result;
    } else {
      let res = toonToJson(input, lang); 
      return res.result;
    }
  }, [input, activeTab, lang]);

  const jsonSide = activeTab === 'json-to-toon' ? input : output;
  const toonSide = activeTab === 'json-to-toon' ? output : input;
  const jsonTokens = estimateTokens(jsonSide.startsWith('Error:') ? '' : jsonSide);
  const toonTokens = estimateTokens(toonSide.startsWith('Error:') ? '' : toonSide);
  const savingsPct = jsonTokens > 0 ? (1 - (toonTokens / jsonTokens)) * 100 : 0;
  const savings = Number.isFinite(savingsPct) ? Number(savingsPct.toFixed(1)) : 0;
  const ratio = toonTokens > 0 ? Number((jsonTokens / toonTokens).toFixed(2)) : null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{strings.title}</h1>
            <p className="text-slate-400">{strings.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
            title={lang === 'en' ? 'Português' : 'English'}
          >
            <Globe size={18} />
            {lang === 'en' ? 'PT' : 'EN'}
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('json-to-toon')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'json-to-toon'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {strings.jsonToToon}
          </button>
          <button
            onClick={() => setActiveTab('toon-to-json')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'toon-to-json'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {strings.toonToJson}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {activeTab === 'json-to-toon' ? strings.inputLabel : strings.inputLabelToon}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-80 p-4 bg-slate-700 text-white border border-slate-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={lang === 'en' ? 'Paste your JSON or TOON here...' : 'Cole aqui o seu JSON ou TOON...'}
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() =>
                  setInput('[\n  {"name": "Alice", "age": 30, "city": "Lisbon"},\n  {"name": "Bob", "age": 25, "city": "Porto"},\n  {"name": "Charlie", "age": 35, "city": "Covilhã"}\n]')
                }
                className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded transition"
              >
                {strings.examplePeople}
              </button>
              <button
                onClick={() =>
                  setInput('[\n  {"id": 1, "product": "Laptop", "price": 999.99, "stock": 15},\n  {"id": 2, "product": "Mouse", "price": 29.99, "stock": 150},\n  {"id": 3, "product": "Keyboard", "price": 79.99, "stock": 45}\n]')
                }
                className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded transition"
              >
                {strings.exampleProducts}
              </button>
              <button
                onClick={() => setInput('')}
                className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded transition ml-auto"
              >
                {strings.clear}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {activeTab === 'json-to-toon' ? strings.outputLabel : strings.outputLabelJson}
            </label>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-80 p-4 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg font-mono text-sm resize-none"
              />
              <button
                onClick={copyToClipboard}
                aria-label={strings.copy}
                title={strings.copy}
                className="absolute top-3 right-3 p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">{strings.calculator}</h2>

          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg">
            <p className="text-amber-200 text-sm">
              <strong>⚠️ {lang === 'en' ? 'Warning' : 'Aviso'}:</strong> {strings.warning}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <p className="text-slate-400 text-sm mb-1">{strings.tokensJson}</p>
              <p className="text-3xl font-bold text-white">{jsonTokens}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <p className="text-slate-400 text-sm mb-1">{strings.tokensToon}</p>
              <p className="text-3xl font-bold text-emerald-400">{toonTokens}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <p className="text-slate-400 text-sm mb-1">{strings.savings}</p>
              <p className={`text-3xl font-bold ${savings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {savings > 0 ? '+' : ''}{savings}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
            <div>
              <p className="text-slate-500 mb-1">{strings.difference}</p>
              <p className="font-mono">{jsonTokens - toonTokens} tokens</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">{strings.ratio}</p>
              <p className="font-mono">{ratio !== null ? `${ratio.toFixed(2)}x` : '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">{strings.sizeJson}</p>
              <p className="font-mono">{(input || '').length} chars</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">{strings.sizeToon}</p>
              <p className="font-mono">{(output || '').length} chars</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
            <h3 className="text-blue-300 font-semibold text-sm mb-2">{strings.why}</h3>
            <p className="text-blue-200 text-sm">{strings.whyText}</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 text-slate-300 text-sm">
            <p>
              <strong>💡 {lang === 'en' ? 'Tip' : 'Dica'}:</strong> {strings.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}