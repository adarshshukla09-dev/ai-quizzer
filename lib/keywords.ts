import yake from "yake";

const extractor = new yake.KeywordExtractor({
  language: "en",
  n: 3,
  dedupLim: 0.7,
  dedupFunc: "seqm",
  windowsSize: 1,
  top: 5,
});

export function extractKeywords(text: string): string[] {
  const keywords = extractor.extract(text);

  return keywords.map((item: any) => item.keyword);
}
