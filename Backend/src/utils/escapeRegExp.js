export const escapeRegExp = (string) => {
    // Escapes special regex characters to prevent regex injection and ReDoS
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};