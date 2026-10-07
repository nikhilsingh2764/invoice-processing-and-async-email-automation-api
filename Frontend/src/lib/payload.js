/** Remove empty strings (the backend rejects "" for optional validated fields) and empty objects, recursively. */
export function stripEmpty(value) {
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = stripEmpty(v);
      const empty = cleaned === '' || cleaned === undefined || (cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0);
      if (!empty) out[k] = cleaned;
    }
    return out;
  }
  return value;
}
