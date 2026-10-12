import { KeywordExtractor } from "@ade_oshineye/yaket";

const extractor = new KeywordExtractor({
  language: "en",
  n: 3,
  dedupLim: 0.7,
  dedupFunc: "seqm",
  windowsSize: 1,
  top: 5,
});

export function extractKeywords(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  const keywords = extractor.extractKeywordDetails(text);

  return keywords.map(({ keyword }:{ keyword: string }) => keyword);
}
