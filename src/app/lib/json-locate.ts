export type JsonPathSegment = string | number;

function escapeJsonPointerSegment(segment: string): string {
  // RFC 6901
  return segment.replaceAll('~', '~0').replaceAll('/', '~1');
}

function pathToPointer(path: JsonPathSegment[]): string {
  if (!path.length) return '';
  return path
    .map((seg) => (typeof seg === 'number' ? String(seg) : escapeJsonPointerSegment(seg)))
    .reduce((acc, seg) => acc + '/' + seg, '');
}

class Scanner {
  private i = 0;

  constructor(
    private readonly text: string,
    private readonly map: Map<string, number>,
  ) {}

  build(): Map<string, number> {
    this.skipWs();
    const rootStart = this.i;
    this.map.set('', rootStart);
    this.parseValue('');
    return this.map;
  }

  private skipWs(): void {
    const s = this.text;
    while (this.i < s.length) {
      const c = s.charCodeAt(this.i);
      // space, \t, \n, \r
      if (c === 32 || c === 9 || c === 10 || c === 13) {
        this.i++;
        continue;
      }
      break;
    }
  }

  private parseValue(pointer: string): void {
    this.skipWs();

    const start = this.i;
    if (!this.map.has(pointer)) this.map.set(pointer, start);

    const s = this.text;
    const ch = s[this.i];
    if (!ch) throw new Error('Unexpected end of input');

    if (ch === '{') {
      this.parseObject(pointer);
      return;
    }

    if (ch === '[') {
      this.parseArray(pointer);
      return;
    }

    if (ch === '"') {
      this.parseString();
      return;
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      this.parseNumber();
      return;
    }

    if (ch === 't') {
      this.consumeLiteral('true');
      return;
    }

    if (ch === 'f') {
      this.consumeLiteral('false');
      return;
    }

    if (ch === 'n') {
      this.consumeLiteral('null');
      return;
    }

    throw new Error(`Unexpected token '${ch}' at ${this.i}`);
  }

  private parseObject(pointer: string): void {
    const s = this.text;
    if (s[this.i] !== '{') throw new Error('Expected {');
    this.i++;
    this.skipWs();

    if (s[this.i] === '}') {
      this.i++;
      return;
    }

    while (this.i < s.length) {
      this.skipWs();
      const keyStart = this.i;
      const key = this.parseString();
      this.skipWs();

      if (s[this.i] !== ':') throw new Error('Expected :');
      this.i++;
      this.skipWs();

      const childPointer = pointer + '/' + escapeJsonPointerSegment(key);
      // For object properties, prefer scrolling to the key ("key": ...)
      if (!this.map.has(childPointer)) this.map.set(childPointer, keyStart);

      this.parseValue(childPointer);
      this.skipWs();

      const c = s[this.i];
      if (c === ',') {
        this.i++;
        continue;
      }
      if (c === '}') {
        this.i++;
        return;
      }

      throw new Error('Expected , or }');
    }

    throw new Error('Unterminated object');
  }

  private parseArray(pointer: string): void {
    const s = this.text;
    if (s[this.i] !== '[') throw new Error('Expected [');
    this.i++;
    this.skipWs();

    if (s[this.i] === ']') {
      this.i++;
      return;
    }

    let idx = 0;
    while (this.i < s.length) {
      this.skipWs();

      const childPointer = pointer + '/' + String(idx);
      if (!this.map.has(childPointer)) this.map.set(childPointer, this.i);
      this.parseValue(childPointer);
      this.skipWs();

      const c = s[this.i];
      if (c === ',') {
        this.i++;
        idx++;
        continue;
      }
      if (c === ']') {
        this.i++;
        return;
      }

      throw new Error('Expected , or ]');
    }

    throw new Error('Unterminated array');
  }

  private parseString(): string {
    const s = this.text;
    if (s[this.i] !== '"') throw new Error('Expected string');
    this.i++; // opening quote

    let out = '';
    while (this.i < s.length) {
      const c = s[this.i];
      if (c === '"') {
        this.i++;
        return out;
      }

      if (c === '\\') {
        this.i++;
        const e = s[this.i];
        if (!e) throw new Error('Unterminated escape');

        if (e === 'u') {
          // \uXXXX
          const hex = s.slice(this.i + 1, this.i + 5);
          if (hex.length !== 4 || !/^[0-9a-fA-F]{4}$/.test(hex)) {
            throw new Error('Invalid unicode escape');
          }
          out += String.fromCharCode(Number.parseInt(hex, 16));
          this.i += 5;
          continue;
        }

        // For pointer building we just need the decoded key string.
        // Handle common JSON escapes.
        switch (e) {
          case '"':
            out += '"';
            break;
          case '\\':
            out += '\\';
            break;
          case '/':
            out += '/';
            break;
          case 'b':
            out += '\b';
            break;
          case 'f':
            out += '\f';
            break;
          case 'n':
            out += '\n';
            break;
          case 'r':
            out += '\r';
            break;
          case 't':
            out += '\t';
            break;
          default:
            throw new Error('Invalid escape');
        }

        this.i++;
        continue;
      }

      out += c;
      this.i++;
    }

    throw new Error('Unterminated string');
  }

  private parseNumber(): void {
    const s = this.text;

    // JSON number grammar (simplified consumption): -? int frac? exp?
    if (s[this.i] === '-') this.i++;

    if (s[this.i] === '0') {
      this.i++;
    } else {
      if (!(s[this.i] >= '1' && s[this.i] <= '9')) throw new Error('Invalid number');
      while (this.i < s.length && s[this.i] >= '0' && s[this.i] <= '9') this.i++;
    }

    if (s[this.i] === '.') {
      this.i++;
      if (!(s[this.i] >= '0' && s[this.i] <= '9')) throw new Error('Invalid number');
      while (this.i < s.length && s[this.i] >= '0' && s[this.i] <= '9') this.i++;
    }

    const e = s[this.i];
    if (e === 'e' || e === 'E') {
      this.i++;
      const sign = s[this.i];
      if (sign === '+' || sign === '-') this.i++;
      if (!(s[this.i] >= '0' && s[this.i] <= '9')) throw new Error('Invalid number');
      while (this.i < s.length && s[this.i] >= '0' && s[this.i] <= '9') this.i++;
    }
  }

  private consumeLiteral(lit: 'true' | 'false' | 'null'): void {
    const s = this.text;
    if (s.slice(this.i, this.i + lit.length) !== lit) throw new Error('Invalid literal');
    this.i += lit.length;
  }
}

export function buildJsonPointerIndex(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const scanner = new Scanner(text, map);
  return scanner.build();
}

export function findJsonPathPosition(text: string, path: JsonPathSegment[]): number | null {
  try {
    const pointer = pathToPointer(path);
    const map = buildJsonPointerIndex(text);
    return map.get(pointer) ?? null;
  } catch {
    return null;
  }
}
