export const estimateTokens = (text) => Math.max(0, Math.ceil(((text || '').length) / 4));

// computeMeta returns token count and placeholders for validation/warnings
export const computeMeta = (text) => {
  return {
    tokens: estimateTokens(text),
    valid: true,
    warnings: [],
  };
};

export default { estimateTokens, computeMeta };
