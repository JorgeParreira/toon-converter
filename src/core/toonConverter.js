const IND = '  ';
const isPrimitive = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
const needsQuoting = (s) => s === '' || /[\s,:"\n]/.test(s);
const escapeString = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
const unescapeQuoted = (s) => s.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

const scalarToTOON = (value) => {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'number' || t === 'boolean') return String(value);
  if (t === 'string') {
    return needsQuoting(value) ? `"${escapeString(value)}"` : value;
  }
  return `"${escapeString(JSON.stringify(value))}"`;
};

const parseScalar = (token) => {
  if (token == null) return null;
  const raw = String(token).trim();
  if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) {
    return unescapeQuoted(raw.slice(1, -1));
  }
  const lower = raw.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (lower === 'null') return null;
  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  if (/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num)) return num;
  }
  return raw;
};

const splitCSV = (line) => {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '\\') {
        if (i + 1 < line.length) {
          const nx = line[++i];
          cur += nx === 'n' ? '\n' : nx === 't' ? '\t' : nx;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur.trim());
  return out;
};

const joinCSV = (values) => values.map(scalarToTOON).join(',');
const countIndent = (s) => {
  let n = 0;
  while (n < s.length && s[n] === ' ') n++;
  return n;
};

const detectHomogeneousSchema = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!arr.every(isPlainObject)) return null;
  const firstKeys = Object.keys(arr[0]);
  const firstKeySet = new Set(firstKeys);
  for (let i = 1; i < arr.length; i++) {
    const keys = Object.keys(arr[i]);
    if (keys.length !== firstKeys.length) return null;
    for (const k of keys) if (!firstKeySet.has(k)) return null;
  }
  for (const obj of arr) {
    for (const k of firstKeys) {
      if (!isPrimitive(obj[k])) return null;
    }
  }
  return firstKeys;
};

const jsonToToonRecursive = (key, val, level, lines) => {
  const pad = IND.repeat(level);
  if (Array.isArray(val)) {
    const n = val.length;
    if (n === 0) {
      lines.push(`${pad}${key}[0]:`);
      return;
    }
    if (val.every(isPrimitive)) {
      lines.push(`${pad}${key}[${n}]: ${joinCSV(val)}`);
      return;
    }
    const schema = detectHomogeneousSchema(val);
    if (schema) {
      lines.push(`${pad}${key}[${n}]{${schema.join(',')}}:`);
      for (const obj of val) {
        const row = schema.map((k) => (obj[k] === undefined ? null : obj[k]));
        lines.push(`${pad}${IND}${joinCSV(row)}`);
      }
      return;
    }
    lines.push(`${pad}${key}[${n}]:`);
    for (const item of val) {
      lines.push(`${pad}${IND}${JSON.stringify(item)}`);
    }
    return;
  }
  if (isPlainObject(val)) {
    const entries = Object.entries(val);
    if (entries.length === 0) {
      lines.push(`${pad}${key}: {}`);
      return;
    }
    lines.push(`${pad}${key}:`);
    for (const [k, v] of entries) {
      if (isPrimitive(v)) {
        lines.push(`${pad}${IND}${k}: ${scalarToTOON(v)}`);
      } else if (Array.isArray(v) || isPlainObject(v)) {
        jsonToToonRecursive(k, v, level + 1, lines);
      } else {
        lines.push(`${pad}${IND}${k}: "${escapeString(JSON.stringify(v))}"`);
      }
    }
    return;
  }
  lines.push(`${pad}${key}: ${scalarToTOON(val)}`);
};

export function jsonToToon(jsonStr, lang = 'en') {
  try {
    const root = JSON.parse(jsonStr);
    const lines = [];
    if (isPlainObject(root)) {
      for (const [k, v] of Object.entries(root)) {
        if (isPrimitive(v)) {
          lines.push(`${k}: ${scalarToTOON(v)}`);
        } else {
          jsonToToonRecursive(k, v, 0, lines);
        }
      }
    } else if (Array.isArray(root)) {
      jsonToToonRecursive('root', root, 0, lines);
    } else {
      lines.push(`root: ${scalarToTOON(root)}`);
    }
    return lines.join('\n');
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

const parseSchemaData = (toonStr, lang = 'en') => {
  try {
    const lines = (toonStr || '').split('\n').map((l) => l.trimEnd());
    const schemaIdx = lines.findIndex((l) => /^SCHEMA:/i.test(l));
    const dataIdx = lines.findIndex((l) => /^DATA:/i.test(l));
    if (schemaIdx === -1) {
      return lang === 'en' ? 'Invalid format: missing SCHEMA line' : 'Formato inválido: falta a linha SCHEMA';
    }
    if (dataIdx === -1 || dataIdx < schemaIdx) {
      return lang === 'en' ? 'Invalid format: missing DATA line after SCHEMA' : 'Formato inválido: falta a linha DATA após o SCHEMA';
    }
    const keysPart = lines[schemaIdx].replace(/^\s*SCHEMA:/i, '').trim();
    const keys = keysPart.split(',').map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return lang === 'en' ? 'Invalid SCHEMA: no keys found' : 'SCHEMA inválido: não foram encontradas chaves';
    }
    const dataLines = lines.slice(dataIdx + 1).map((l) => l.trim()).filter((l) => l.length > 0);
    const arr = dataLines.map((row) => {
      const tokens = splitCSV(row);
      const obj = {};
      keys.forEach((k, i) => {
        obj[k] = parseScalar(tokens[i] !== undefined ? tokens[i] : 'null');
      });
      return obj;
    });
    return JSON.stringify(arr, null, 2);
  } catch (e) {
    return `Error: ${e.message}`;
  }
};

const parseStructuredToJSON = (toonStr) => {
  const rawLines = (toonStr || '').split('\n').map((l) => l.replace(/\r$/, ''));
  let i = 0;
  const parseObjectAtIndent = (baseIndent) => {
    const obj = {};
    while (i < rawLines.length) {
      const raw = rawLines[i];
      const line = raw.trimEnd();
      if (!line.trim()) {
        i++;
        continue;
      }
      const indent = countIndent(raw);
      if (indent < baseIndent) break;
      if (indent > baseIndent) break;
      
      const rootSchemaMatch = line.match(/^([a-zA-Z_]+(?:\s*,\s*[a-zA-Z_]+)+)\s*:\s*$/);
      if (rootSchemaMatch && baseIndent === 0 && rawLines[i + 1]?.trim().includes(',')) {
        const keys = rootSchemaMatch[1].split(',').map(s => s.trim());
        i++;
        const arr = [];
        while (i < rawLines.length) {
          const l2 = rawLines[i];
          const indent2 = countIndent(l2);
          if (indent2 <= baseIndent || !l2.trim()) break;
          const values = splitCSV(l2.trim()).map(parseScalar);
          const obj = {};
          keys.forEach((k, idx) => obj[k] = values[idx]);
          arr.push(obj);
          i++;
        }
        return arr;
      }

      let m = line.match(/^([^:\[\]]+)\[(\d+)\]\{([^}]*)\}:\s*$/);
      if (m) {
        const key = m[1].trim();
        const schema = m[3].split(',').map((s) => s.trim()).filter(Boolean);
        i++;
        const arr = [];
        while (i < rawLines.length) {
          const raw2 = rawLines[i];
          const indent2 = countIndent(raw2);
          if (indent2 <= baseIndent) break;
          if (indent2 > baseIndent + IND.length) {
            i++;
            continue;
          }
          const rowLine = raw2.trim();
          if (rowLine) {
            const tokens = splitCSV(rowLine);
            const objRow = {};
            schema.forEach((k, idx) => {
              objRow[k] = parseScalar(tokens[idx] !== undefined ? tokens[idx] : 'null');
            });
            arr.push(objRow);
          }
          i++;
        }
        obj[key] = arr;
        continue;
      }
      m = line.match(/^([^:\[\]]+)\[(\d+)\]:\s*(.*)$/);
      if (m) {
        const key = m[1].trim();
        const rest = m[3].trim();
        if (rest.length > 0) {
          obj[key] = splitCSV(rest).map(parseScalar);
          i++;
          continue;
        }
        i++;
        const arr = [];
        while (i < rawLines.length) {
          const raw2 = rawLines[i];
          const indent2 = countIndent(raw2);
          if (indent2 <= baseIndent) break;
          if (indent2 > baseIndent + IND.length) {
            i++;
            continue;
          }
          const trimmed = raw2.trim();
          if (!trimmed) {
            i++;
            continue;
          }
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              arr.push(JSON.parse(trimmed));
            } catch {
              arr.push(splitCSV(trimmed).map(parseScalar));
            }
          } else {
            arr.push(splitCSV(trimmed).map(parseScalar));
          }
          i++;
        }
        obj[key] = arr;
        continue;
      }
      m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) {
        const key = m[1].trim();
        const rest = m[2].trim();
        if (rest.length === 0) {
          i++;
          obj[key] = parseObjectAtIndent(baseIndent + IND.length);
        } else {
          obj[key] = parseScalar(rest);
          i++;
        }
        continue;
      }
      i++;
    }
    return obj;
  };
  const result = parseObjectAtIndent(0);
  return JSON.stringify(result, null, 2);
};

const detectToonDialect = (str) => (/^\s*SCHEMA:/im.test(str) ? 'schema' : 'structured');

export function toonToJson(toonStr, lang = 'en') {
  try {
    const dialect = detectToonDialect(toonStr || '');
    return dialect === 'schema' ? parseSchemaData(toonStr, lang) : parseStructuredToJSON(toonStr);
  } catch (e) {
    return `Error: ${e.message}`;
  }
}
