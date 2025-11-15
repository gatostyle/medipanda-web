#!/usr/bin/env node
// Minimal OpenAPI → TypeScript generator (no third-party libs).
// Usage: node generate-backend.js ./api-docs.json ./backend.ts

const fs = require('fs');
const path = require('path');

const inFile = process.argv[2] || 'api-docs.json';
const outFile = process.argv[3] || 'backend.ts';

const spec = JSON.parse(fs.readFileSync(inFile, 'utf8'));

const schemas = (spec.components && spec.components.schemas) || {};
const paths = spec.paths || {};

const out = [];
const seen = new Set();

// --- Utilities ---------------------------------------------------------------

function withNull(typeStr) {
  // Add `| null` once, if not already present.
  return /\bnull\b/.test(typeStr) ? typeStr : `${typeStr} | null`;
}

function recordType(valueType) {
  return `Record<string, ${valueType}>`;
}

function ensureGetPrefix(name) {
  return /^get[A-Z_]/.test(name) ? name : `get${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function pascalCase(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function camelCase(name) {
  const p = pascalCase(name);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function safeIdent(name) {
  const n = String(name).replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[A-Za-z_]/.test(n) ? n : '_' + n;
}

function resolveRef(ref) {
  // Only supports #/components/schemas/...
  const m = /^#\/components\/schemas\/(.+)$/.exec(ref || '');
  if (!m) return null;
  const key = m[1];
  return schemas[key];
}

function pick2xxResponse(responses) {
  if (!responses) return null;
  const keys = Object.keys(responses)
    .filter(k => /^2\d\d$/.test(k))
    .sort();
  if (keys.length === 0) return null;
  // prefer 200, else lowest 2xx
  const k = keys.includes('200') ? '200' : keys[0];
  return responses[k];
}

function mapNumericFormat(format) {
  // OpenAPI numeric formats all map to number in TS
  return 'number';
}

function tsPrimitive(type, format) {
  switch (type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return mapNumericFormat(format);
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    default:
      return 'any';
  }
}

function union(arr) {
  const flat = arr.filter(Boolean);
  const s = Array.from(new Set(flat));
  return s.join(' | ') || 'any';
}

function intersection(arr) {
  const flat = arr.filter(Boolean);
  return flat.join(' & ') || 'any';
}

function addLine(s = '') {
  out.push(s);
}

function typeFromRef(ref) {
  const m = /^#\/components\/schemas\/(.+)$/.exec(ref || '');
  return m ? m[1] : 'any';
}

// Produces a TS type expression from an inline schema (does not emit named types).
function tsType(schema, ctxName) {
  if (!schema) return 'any';

  if (schema.$ref) {
    return typeFromRef(schema.$ref);
  }

  // Nullable
  const nullUnion = schema.nullable ? ' | null' : '';

  // Binary string → File
  if (schema.type === 'string' && schema.format === 'binary') {
    return `File${nullUnion}`;
  }

  // date-time string → DateTimeString
  if (schema.type === 'string' && schema.format === 'date-time') {
    return `DateTimeString${nullUnion}`;
  }

  // date string → DateString
  if (schema.type === 'string' && schema.format === 'date') {
    return `DateString${nullUnion}`;
  }

  // Enums
  if (schema.enum) {
    const vals = schema.enum.map(v => (typeof v === 'string' ? JSON.stringify(v) : String(v)).replace(/"/g, "'"));
    return `(${vals.join(' | ')})${nullUnion}`;
  }

  // oneOf / anyOf / allOf
  if (schema.oneOf) {
    return `(${union(schema.oneOf.map(s => tsType(s)))})${nullUnion}`;
  }
  if (schema.anyOf) {
    return `(${union(schema.anyOf.map(s => tsType(s)))})${nullUnion}`;
  }
  if (schema.allOf) {
    return `(${intersection(schema.allOf.map(s => tsType(s)))})${nullUnion}`;
  }

  // Arrays
  if (schema.type === 'array') {
    return `${tsType(schema.items || {})}[]${schema.nullable ? ' | null' : ''}`;
  }

  // Objects / records
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const lines = Object.keys(props)
      .sort()
      .map(key => {
        const prop = props[key];
        const optional = required.has(key) ? '' : '?';
        const keyIdent = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
        return `  ${keyIdent}${optional}: ${tsType(prop, key)};`;
      });

    if (schema.additionalProperties) {
      const valType = schema.additionalProperties === true ? 'any' : tsType(schema.additionalProperties);
      if (lines.length === 0) {
        return `${recordType(valType)}${nullUnion}`;
      }
      const objLit = `{\n${lines.join('\n')}\n}`;
      return `${objLit} & ${recordType(valType)}${nullUnion}`;
    }
    return `{\n${lines.join('\n')}\n}${nullUnion}`;
  }

  // Primitives
  return `${tsPrimitive(schema.type, schema.format)}${nullUnion}`;
}

// Emit named schema as interface/type
function emitSchema(name, schema) {
  if (seen.has(name)) return;
  seen.add(name);

  // Resolve simple $ref wrappers (rare)
  if (schema.$ref) {
    const refName = typeFromRef(schema.$ref);
    addLine(`export type ${name} = ${refName};`);
    addLine();
    return;
  }

  // Enum-only
  if (schema.enum && !schema.type) {
    addLine(`export type ${name} = ${tsType(schema)};`);
    addLine();
    return;
  }

  // Decide interface vs type
  const isObjectLike = schema.type === 'object' || schema.properties || schema.allOf || schema.anyOf || schema.oneOf;
  if (isObjectLike) {
    // Try to make an interface if it is a plain object without unions/intersections
    const plainObject = (schema.type === 'object' || schema.properties) && !schema.allOf && !schema.anyOf && !schema.oneOf;
    if (plainObject) {
      const props = schema.properties || {};
      const required = new Set(schema.required || []);
      const addl = schema.additionalProperties;
      const hasAddl = !!addl;
      const addlType = addl === true ? 'any' : tsType(addl);
      // Optionality overrides:
      // 1) SortObject / PageableObject => all required
      // 2) Any interface with a top-level 'pageable' prop => all required
      const forceAllRequired =
        name === 'SortObject' || name === 'PageableObject' || Object.prototype.hasOwnProperty.call(props, 'pageable');
      // Decide representation:
      // If no explicit props and only additionalProperties → pure Record
      if (Object.keys(props).length === 0 && hasAddl) {
        addLine(`export type ${name} = ${recordType(addlType)};`);
        addLine();
        return;
      }

      // Otherwise: object literal (possibly intersected with Record)
      const linesArr = [];
      Object.keys(props)
        .sort()
        .forEach(key => {
          const prop = props[key];
          const isOptional = !forceAllRequired && !required.has(key);
          const keyIdent = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
          const baseType = tsType(prop, key);
          const finalType = isOptional ? withNull(baseType) : baseType;
          // In interfaces, never emit "?" — use `Type | null` for optional props.
          linesArr.push(`  ${keyIdent}: ${finalType};`);
        });

      const objectLiteral = `{\n${linesArr.join('\n')}\n}`;
      if (hasAddl) {
        addLine(`export type ${name} = ${objectLiteral} & ${recordType(addlType)};`);
      } else {
        addLine(`export interface ${name} ${objectLiteral}`);
      }
      addLine();
    } else {
      // Complex object composition → type alias
      addLine(`export type ${name} = ${tsType(schema, name)};`);
      addLine();
    }
  } else {
    // Primitive / array aliases
    addLine(`export type ${name} = ${tsType(schema, name)};`);
    addLine();
  }
}

// Convert OpenAPI schema (for parameters) to TS type
function tsParamType(p) {
  return tsType(p.schema || {});
}

function buildFunctionName(method, pathStr, operationId) {
  if (operationId) return safeIdent(operationId);
  // fallback: method + path
  const frag = pathStr
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/\{|\}/g, 'By'));
  return camelCase(`${method}_${frag.join('_') || 'root'}`);
}

function buildUrlTemplate(pathStr, pathParams) {
  // Replace {id} with ${id} in template string
  let template = pathStr.replace(/{/g, '${');
  return '`' + template + '`';
}

function analyzeReturn(resp) {
  // Decide TS return type and whether axios needs responseType: 'blob'
  if (!resp || !resp.content) return { ts: 'void', wantsBlob: false };
  const contentKeys = Object.keys(resp.content);
  if (contentKeys.length === 0) return { ts: 'void', wantsBlob: false };
  // Prefer JSON, but keep the actual key so we can detect octet-stream properly.
  const preferred = contentKeys.includes('application/json') ? 'application/json' : contentKeys[0];
  const media = resp.content[preferred];
  const schema = media && media.schema;

  // If media type is octet-stream with or without schema → Blob
  if (/^application\/octet-stream$/i.test(preferred)) {
    return { ts: 'Blob', wantsBlob: true };
  }
  // If schema is string+byte → Blob
  if (schema && !schema.$ref && schema.type === 'string' && schema.format === 'byte') {
    return { ts: 'Blob', wantsBlob: true };
  }
  // If schema is a $ref that resolves to string+byte, treat as Blob as well
  if (schema && schema.$ref) {
    const r = resolveRef(schema.$ref);
    if (r && r.type === 'string' && r.format === 'byte') {
      return { ts: 'Blob', wantsBlob: true };
    }
  }
  // Fallback to computed TS type
  const ts = schema ? tsType(schema) : 'any';
  return { ts, wantsBlob: false };
}

function collectQueryParams(parameters) {
  return (parameters || []).filter(p => p.in === 'query');
}
function collectPathParams(parameters) {
  return (parameters || []).filter(p => p.in === 'path');
}

function requestBodyKinds(requestBody) {
  if (!requestBody || !requestBody.content) return {};
  const c = requestBody.content;
  return {
    json: c['application/json'] || null,
    multipart: c['multipart/form-data'] || null,
    urlencoded: c['application/x-www-form-urlencoded'] || null,
  };
}

function emitHeader() {
  addLine(`/* eslint-disable @typescript-eslint/no-empty-object-type */`);
  addLine(`import axios from '@/utils/axios';`);
  addLine();
  addLine(`export class DateTimeString extends String {`);
  addLine(`  public constructor(value: string | Date) {`);
  addLine(`    if (value instanceof Date) {`);
  addLine(`      value = value.toISOString();`);
  addLine(`    }`);
  addLine();
  addLine(`    super(value);`);
  addLine(`  }`);
  addLine(`}`);
  addLine();
  addLine(`export class DateString extends String {`);
  addLine(`  public constructor(value: string | Date) {`);
  addLine(`    if (value instanceof Date) {`);
  addLine(`      value = value.toISOString().split('T')[0];`);
  addLine(`    }`);
  addLine();
  addLine(`    super(value);`);
  addLine(`  }`);
  addLine(`}`);
  addLine();
}

function emitSchemas() {
  const keys = Object.keys(schemas);
  // Stable sort for minimal diffs
  keys.sort();
  keys.forEach(k => emitSchema(k, schemas[k]));
}

// --- Helpers for building form bodies inside functions -----------------------
function isBinarySchema(s) {
  const x = s && (s.$ref ? resolveRef(s.$ref) : s);
  return x && x.type === 'string' && x.format === 'binary';
}

function deref(s) {
  return s && s.$ref ? resolveRef(s.$ref) || s : s || {};
}

function propAccess(base, key) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`;
}

function isArrayParam(p) {
  return p.schema && p.schema.type === 'array';
}

function emitAppendForProp(formVar, key, accessor, propSchema, asUrlEncoded, isOptional, isNullable) {
  const ps = deref(propSchema);
  const kLit = JSON.stringify(key);

  // 🔧 수정: FormData append에 String() 변환 추가
  const appendValue = (value) => {
    if (['number', 'integer', 'boolean'].includes(ps.type)) {
      return `String(${value})`;
    }
    return value;
  };

  const append = asUrlEncoded ?
    `${formVar}.append(${kLit}, String(VALUE));` :
    `${formVar}.append(${kLit}, VALUE);`;

  // Decide guard per rules
  const guard =
    isOptional && isNullable
      ? `${accessor} !== undefined && ${accessor} !== null`
      : isOptional
        ? `${accessor} !== undefined`
        : isNullable
          ? `${accessor} !== null`
          : null;

  if (ps.type === 'array') {
    const items = deref(ps.items || {});
    if (guard) addLine(`  if (${guard}) {`);
    addLine(`    for (const v of ${accessor}) {`);
    if (isBinarySchema(items) && !asUrlEncoded) {
      addLine(`      ${formVar}.append(${kLit}, v, v.name.normalize('NFC'));`);
    } else if (['string', 'number', 'integer', 'boolean'].includes(items.type)) {
      addLine(`      ${formVar}.append(${kLit}, String(v));`);
    } else {
      // Array item is object/complex: send JSON
      addLine(
        `      ${
          asUrlEncoded
            ? `${formVar}.append(${kLit}, JSON.stringify(v));`
            : `${formVar}.append(${kLit}, new Blob([JSON.stringify(v)], { type: 'application/json' }));`
        }`,
      );
    }
    addLine(`    }`);
    if (guard) addLine(`  }`);
    return;
  }

  if (isBinarySchema(ps) && !asUrlEncoded) {
    if (guard) {
      addLine(`  if (${guard}) { ${formVar}.append(${kLit}, ${accessor}, ${accessor}.name.normalize('NFC')); }`);
    } else {
      addLine(`  ${formVar}.append(${kLit}, ${accessor}, ${accessor}.name.normalize('NFC'));`);
    }
  } else if (['string', 'number', 'integer', 'boolean'].includes(ps.type)) {
    // 🔧 수정: number/integer/boolean은 String()으로 변환
    const convertedAccessor = ['number', 'integer', 'boolean'].includes(ps.type) ?
      `String(${accessor})` : accessor;

    if (guard) {
      addLine(`  if (${guard}) { ${formVar}.append(${kLit}, ${convertedAccessor}); }`);
    } else {
      addLine(`  ${formVar}.append(${kLit}, ${convertedAccessor});`);
    }
  } else if (ps.type === 'object' || ps.properties || ps.additionalProperties) {
    if (guard) {
      addLine(
        `  if (${guard}) { ${
          asUrlEncoded
            ? `${formVar}.append(${kLit}, JSON.stringify(${accessor}));`
            : `${formVar}.append(${kLit}, new Blob([JSON.stringify(${accessor})], { type: 'application/json' }));`
        } }`,
      );
    } else {
      addLine(
        `  ${
          asUrlEncoded
            ? `${formVar}.append(${kLit}, JSON.stringify(${accessor}));`
            : `${formVar}.append(${kLit}, new Blob([JSON.stringify(${accessor})], { type: 'application/json' }));`
        }`,
      );
    }
  } else {
    if (guard) {
      addLine(`  if (${guard}) { ${formVar}.append(${kLit}, String(${accessor})); }`);
    } else {
      addLine(`  ${formVar}.append(${kLit}, String(${accessor}));`);
    }
  }
}

function emitFormPopulation(rootSchema, formVar, dataVar, asUrlEncoded) {
  const s = deref(rootSchema || {});
  // If we don't know the structure, send the whole thing as JSON string under "payload".
  if (!(s.type === 'object' || s.properties)) {
    addLine(`  const ${formVar} = ${asUrlEncoded ? 'new URLSearchParams()' : 'new FormData()'};`);
    addLine(
      `  if (${dataVar} !== undefined && ${dataVar} !== null) { ${
        asUrlEncoded
          ? `${formVar}.append('payload', JSON.stringify(${dataVar}));`
          : `${formVar}.append('payload', new Blob([JSON.stringify(${dataVar})], { type: 'application/json' }));`
      } }`,
    );
    return formVar;
  }
  addLine(`  const ${formVar} = ${asUrlEncoded ? 'new URLSearchParams()' : 'new FormData()'};`);
  const props = s.properties || {};
  const requiredSet = new Set(s.required || []);
  Object.keys(props).forEach(key => {
    const acc = propAccess(dataVar, key);
    const isOptional = !requiredSet.has(key);
    const isNullable = !!props[key]?.nullable;
    emitAppendForProp(formVar, key, acc, props[key], asUrlEncoded, isOptional, isNullable);
  });
  return formVar;
}

function emitApis() {
  Object.keys(paths)
    .sort()
    .forEach(p => {
      const item = paths[p];
      ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(method => {
        if (!item[method]) return;
        const op = item[method];

        const fnName = buildFunctionName(method, p, op.operationId);
        const pathParams = collectPathParams(op.parameters || []);
        const queryParams = collectQueryParams(op.parameters || []);

        // Build param list
        const fnParams = [];

        // Path params as positional args
        pathParams.forEach(pp => {
          const typ = tsParamType(pp);
          fnParams.push(`${safeIdent(pp.name)}: ${typ}`);
        });

        // Body / Form
        const kinds = requestBodyKinds(op.requestBody);
        let bodyArg = '';
        if (kinds.json && kinds.json.schema) {
          bodyArg = `data: ${tsType(kinds.json.schema)}`;
          fnParams.push(bodyArg);
        } else if (kinds.multipart && kinds.multipart.schema) {
          // Strong type; build FormData internally
          bodyArg = `data: ${tsType(kinds.multipart.schema)}`;
          fnParams.push(bodyArg);
        } else if (kinds.urlencoded && kinds.urlencoded.schema) {
          // Strong type; build URLSearchParams internally
          bodyArg = `data: ${tsType(kinds.urlencoded.schema)}`;
          fnParams.push(bodyArg);
        }

        // Query options
        if (queryParams.length > 0) {
          const fields = queryParams
            .map(qp => {
              const t = tsParamType(qp);
              return `  ${safeIdent(qp.name)}?: ${t};`;
            })
            .join('\n');
          fnParams.push(`options?: {\n${fields}\n}`);
        }

        // Return type from best 2xx response
        const resp = pick2xxResponse(op.responses);
        const ret = analyzeReturn(resp);
        const returnType = ret.ts;

        // Emit function
        addLine(`/**`);
        if (op.summary) addLine(` * ${op.summary}`);
        addLine(` * ${method.toUpperCase()} ${p}`);
        addLine(` */`);
        const urlExpr = pathParams.length > 0 ? buildUrlTemplate(p, pathParams) : JSON.stringify(p);

        // Special case: GET + Blob → generate URL builder returning string
        if (ret.wantsBlob && method === 'get') {
          const urlFnName = ensureGetPrefix(fnName);
          addLine(`export function ${urlFnName}(${fnParams.join(', ')}): string {`);
          addLine(`  const baseUrl = ${urlExpr};`);
          if (queryParams.length > 0) {
            addLine(`  const paramsInit = Object.entries(options ?? {})`);
            addLine(`    .filter(([_, value]) => value !== null && value !== undefined)`);
            addLine(`    .map(([key, value]) => [key, String(value)]);`);
            addLine(`  const params = new URLSearchParams(paramsInit);`);
            addLine(`  return \`\${baseUrl}?\${params.toString()}\`;`);
          } else {
            addLine(`  return baseUrl;`);
          }
          addLine(`}`);
          addLine();
          return; // Skip axios-style emitter for this op
        }

        addLine(`export async function ${fnName}(${fnParams.join(', ')}): Promise<${returnType}> {`);

        // Build axios request object text
        const parts = [];
        parts.push(`method: '${method.toUpperCase()}'`);
        parts.push(`url: ${urlExpr}`);

        if (queryParams.length > 0) {
          const arrayFields = queryParams.filter(isArrayParam);
          if (arrayFields.length === 0) {
            parts.push(`params: options`);
          } else {
            parts.push(`params: {\n      ...options`);
            arrayFields.forEach(qp => {
              const key = safeIdent(qp.name);
              parts.push(`  ${key}: options?.${key}?.join(',')`);
            });
            parts.push(`}`);
          }
        }
        if (ret.wantsBlob) parts.push(`responseType: 'blob'`);

        // Build body
        if (kinds.json && kinds.json.schema) {
          parts.push(`data`);
        } else if (kinds.multipart && kinds.multipart.schema) {
          // Build FormData from strong-typed 'data'
          const formVar = 'form';
          emitFormPopulation(kinds.multipart.schema, formVar, 'data', /*asUrlEncoded*/ false);
          parts.push(`data: ${formVar}`);
        } else if (kinds.urlencoded && kinds.urlencoded.schema) {
          // Build URLSearchParams from strong-typed 'data'
          const formVar = 'form';
          emitFormPopulation(kinds.urlencoded.schema, formVar, 'data', /*asUrlEncoded*/ true);
          parts.push(`data: ${formVar}`);
        }

        if (returnType === 'void') {
          addLine(`  await axios.request({`);
          addLine('    ' + parts.join(',\n    '));
          addLine(`  });`);
        } else {
          addLine(`  const response = await axios.request<${returnType}>({`);
          addLine('    ' + parts.join(',\n    '));
          addLine(`  });`);
          addLine(`  return response.data;`);
        }
        addLine(`}`);
        addLine();
      });
    });
}

// --- Generate ----------------------------------------------------------------
emitHeader();
emitSchemas();
emitApis();

// Write file
fs.writeFileSync(outFile, out.join('\n'), 'utf8');

console.log(`Generated ${outFile} from ${inFile}`);