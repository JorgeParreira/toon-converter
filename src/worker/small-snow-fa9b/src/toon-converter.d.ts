declare module "../../../core/toonConverter.js" {
  export type Meta = { tokens: number; valid: boolean; warnings: string[] };
  export type CoreResult = { result: string; meta: Meta };
  export function jsonToToon(input: string, lang?: string): CoreResult | string;
  export function toonToJson(input: string, lang?: string): CoreResult | string;
}

declare module "../../../core/tokens.js" {
  export function estimateTokens(text: string): number;
  export function computeMeta(text: string): { tokens: number; valid: boolean; warnings: string[] };
}
