import React, { useState, useMemo } from 'react';
import { Copy, Check, Globe } from 'lucide-react';

export default function TOONConverter() {
  const [input, setInput] = useState('[\n  {"name": "Alice", "age": 30, "city": "Lisbon"},\n  {"name": "Bob", "age": 25, "city": "Porto"}\n]');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('json-to-toon');
  const [lang, setLang] = useState('en');

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
      warning: 'TOON works best with tabular arrays (uniform data in rows).',
      tokensJson: 'JSON Tokens',
      tokensToon: 'TOON Tokens',
      savings: 'Savings',
      difference: 'Difference',
      ratio: 'Ratio',
      sizeJson: 'JSON Size',
      sizeToon: 'TOON Size',
      why: 'Why TOON Saves Tokens?',
      whyText: 'TOON eliminates redundancy by declaring fields once in the header and then listing only values. Instead of repeating "name", "age", "city" in each row (like JSON does), TOON writes them only once.',
      tip: 'Token estimate is approximate (1 token ≈ 4 characters).',
      copy: 'Copy to clipboard'
    },
    pt: {
      title: 'Conversor TOON',
      subtitle: 'Converte entre JSON e TOON, calcula poupança de tokens',
      jsonToToon: 'JSON → TOON',
      toonToJson: 'TOON → JSON',
      inputLabel: 'Input JSON',
      inputLabelToon: 'Input TOON',
      outputLabel: 'Output TOON',
      outputLabelJson: 'Output JSON',
      examplePeople: 'Exemplo 1: Pessoas',
      exampleProducts: 'Exemplo 2: Produtos',
      clear: 'Limpar',
      calculator: 'Calculadora de Tokens',
      warning: 'TOON funciona melhor com arrays tabulares (dados uniformes em linhas).',
      tokensJson: 'Tokens JSON',
      tokensToon: 'Tokens TOON',
      savings: 'Poupança',
      difference: 'Diferença',
      ratio: 'Razão',
      sizeJson: 'Tamanho JSON',
      sizeToon: 'Tamanho TOON',
      why: 'Porquê TOON economiza tokens?',
      whyText: 'TOON elimina redundância ao declarar os campos uma única vez no cabeçalho e depois listar apenas os valores. Em vez de repetir "name", "age", "city" em cada linha (como JSON faz), TOON escreve-os uma única vez.',
      tip: 'A estimativa de tokens é aproximada (1 token ≈ 4 caracteres).',
      copy: 'Copiar para clipboard'
    }
  };

  const strings = t[lang];

  const estimateTokens = (text) => Math.ceil(text.length / 4);

  const jsonToToon = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data) || data.length === 0) return lang === 'en' ? 'TOON format works best with arrays of objects' : 'TOON formato funciona melhor com arrays de objetos';
      
      const firstObj = data[0];
      const keys = Object.keys(firstObj);
      
      let toon = `SCHEMA: ${keys.join(', ')}\nDATA:\n`;
      
      data.forEach(obj => {
        const values = keys.map(k => JSON.stringify(obj[k])).join(', ');
        toon += `${values}\n`;
      });
      
      return toon.trim();
    } catch (e) {
      return `Error: ${e.message}`;
    }
  };

  const toonToJson = (toonStr) => {
    try {
      const lines = toonStr.trim().split('\n');
      const schemaLine = lines.find(l => l.startsWith('SCHEMA:'));
      
      if (!schemaLine) return lang === 'en' ? 'Invalid format: missing SCHEMA line' : 'Formato inválido: falta linha SCHEMA';
      
      const keys = schemaLine.replace('SCHEMA:', '').split(',').map(k => k.trim());
      const dataStart = lines.findIndex(l => l.startsWith('DATA:')) + 1;
      
      const data = lines.slice(dataStart).map(line => {
        if (!line.trim()) return null;
        const values = line.split(',').map(v => {
          v = v.trim();
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        });
        const obj = {};
        keys.forEach((k, i) => {
          obj[k] = values[i];
        });
        return obj;
      }).filter(Boolean);
      
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return `Error: ${e.message}`;
    }
  };

  const output = useMemo(() => {
    if (activeTab === 'json-to-toon') {
      return jsonToToon(input);
    } else {
      return toonToJson(input);
    }
  }, [input, activeTab]);

  const jsonTokens = estimateTokens(activeTab === 'json-to-toon' ? input : output);
  const toonTokens = estimateTokens(activeTab === 'json-to-toon' ? output : input);
  const savings = ((1 - toonTokens / jsonTokens) * 100).toFixed(1);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                onClick={() => setInput('[\n  {"name": "Alice", "age": 30, "city": "Lisbon"},\n  {"name": "Bob", "age": 25, "city": "Porto"},\n  {"name": "Charlie", "age": 35, "city": "Covilhã"}\n]')}
                className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded transition"
              >
                {strings.examplePeople}
              </button>
              <button
                onClick={() => setInput('[\n  {"id": 1, "product": "Laptop", "price": 999.99, "stock": 15},\n  {"id": 2, "product": "Mouse", "price": 29.99, "stock": 150},\n  {"id": 3, "product": "Keyboard", "price": 79.99, "stock": 45}\n]')}
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
                className="absolute top-3 right-3 p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
                title={strings.copy}
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
            <p className="text-amber-200 text-sm"><strong>⚠️ {lang === 'en' ? 'Warning' : 'Aviso'}:</strong> {strings.warning}</p>
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
              <p className="font-mono">{(jsonTokens / toonTokens).toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">{strings.sizeJson}</p>
              <p className="font-mono">{input.length} chars</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">{strings.sizeToon}</p>
              <p className="font-mono">{output.length} chars</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
            <h3 className="text-blue-300 font-semibold text-sm mb-2">{strings.why}</h3>
            <p className="text-blue-200 text-sm">{strings.whyText}</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 text-slate-300 text-sm">
            <p><strong>💡 {lang === 'en' ? 'Tip' : 'Dica'}:</strong> {strings.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}