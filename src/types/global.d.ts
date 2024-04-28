// css module type declaration
declare module '*.css' {
  const content: string;
  export default content;
}

declare class Highlight {
  constructor(...range: Range[]);
  add(range: Range): void;
  delete(range: Range): void;
  clear(): void;
}

declare namespace CSS {
  var highlights: Map<string, Highlight>;
}
