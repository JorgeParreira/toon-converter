declare module "../../../core/toonConverter.js" {
  export function jsonToToon(input: string, lang?: string): string;
  export function toonToJson(input: string, lang?: string): string;
}
