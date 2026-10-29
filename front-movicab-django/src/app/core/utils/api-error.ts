export function toApiMessage(error: unknown): string {
  const body = (error as { error?: unknown })?.error ?? error;
  
  function walk(node: unknown): string | null {
    if (typeof node === 'string') return node;
    if (Array.isArray(node) && node.length > 0) return walk(node[0]);
    if (typeof node === 'object' && node !== null) {
      const obj = node as Record<string, unknown>;
      if (obj['detail']) return walk(obj['detail']);
      if (obj['non_field_errors']) return walk(obj['non_field_errors']);
      const keys = Object.keys(obj);
      if (keys.length > 0) return walk(obj[keys[0]]);
    }
    return null;
  }

  return walk(body) ?? 'Ocurrió un error inesperado.';
}
