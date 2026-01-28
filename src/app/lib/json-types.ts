export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';

export function getJsonNodeType(value: JsonValue): JsonNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'object';
  }
}

export function isContainerType(type: JsonNodeType): boolean {
  return type === 'array' || type === 'object';
}
