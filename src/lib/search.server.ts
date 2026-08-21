import { PRODUCT_DOCS, type ProductDoc } from "./products";

const MODEL = "openai/text-embedding-3-small";
const DIMS = 512;

export type IndexedDoc = ProductDoc & { embedding: number[]; point: [number, number] };

let indexPromise: Promise<IndexedDoc[]> | null = null;

async function embed(inputs: string[]): Promise<number[][]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, input: inputs, dimensions: DIMS }),
  });
  if (!res.ok) {
    throw new Error(`Embedding request failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** Deterministic 2D projection of embeddings via power-iteration PCA. */
function project(vectors: number[][]): [number, number][] {
  const n = vectors.length;
  const d = vectors[0]!.length;
  const mean = new Array(d).fill(0);
  for (const v of vectors) for (let i = 0; i < d; i++) mean[i] += v[i]! / n;
  const centered = vectors.map((v) => v.map((x, i) => x - mean[i]!));

  const components: number[][] = [];
  let work = centered.map((v) => [...v]);
  for (let c = 0; c < 2; c++) {
    let comp = new Array(d).fill(0).map((_, i) => Math.sin((i + 1) * (c + 1) * 0.37));
    for (let iter = 0; iter < 60; iter++) {
      const next = new Array(d).fill(0);
      for (const v of work) {
        let s = 0;
        for (let i = 0; i < d; i++) s += v[i]! * comp[i]!;
        for (let i = 0; i < d; i++) next[i] += s * v[i]!;
      }
      const norm = Math.sqrt(next.reduce((acc, x) => acc + x * x, 0)) || 1;
      comp = next.map((x) => x / norm);
    }
    components.push(comp);
    work = work.map((v) => {
      let s = 0;
      for (let i = 0; i < d; i++) s += v[i]! * comp[i]!;
      return v.map((x, i) => x - s * comp[i]!);
    });
  }

  return centered.map((v) => {
    const coords = components.map((comp) => {
      let s = 0;
      for (let i = 0; i < d; i++) s += v[i]! * comp[i]!;
      return s;
    });
    return [coords[0]!, coords[1]!] as [number, number];
  });
}

export async function getIndex(): Promise<IndexedDoc[]> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const embeddings = await embed(
        PRODUCT_DOCS.map((d) => `${d.metadata.product} (${d.metadata.category}): ${d.text}`),
      );
      const points = project(embeddings);
      return PRODUCT_DOCS.map((doc, i) => ({ ...doc, embedding: embeddings[i]!, point: points[i]! }));
    })().catch((err) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise!;
}

const STOP = new Set([
  "the","a","an","and","or","for","with","of","to","in","on","is","are","best","good","that","this",
]);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** BM25 keyword scoring over the corpus. */
export function bm25Scores(query: string, docs: IndexedDoc[]) {
  const k1 = 1.5;
  const b = 0.75;
  const tokenized = docs.map((d) =>
    tokenize(`${d.metadata.product} ${d.metadata.brand} ${d.metadata.category} ${d.text}`),
  );
  const avgLen = tokenized.reduce((s, t) => s + t.length, 0) / (tokenized.length || 1);
  const qTerms = tokenize(query);

  return tokenized.map((tokens) => {
    let score = 0;
    for (const term of qTerms) {
      const df = tokenized.filter((t) => t.includes(term)).length;
      if (df === 0) continue;
      const tf = tokens.filter((t) => t === term).length;
      if (tf === 0) continue;
      const idf = Math.log(1 + (tokenized.length - df + 0.5) / (df + 0.5));
      score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * tokens.length) / avgLen)));
    }
    return score;
  });
}

export function normalize(values: number[]) {
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

export async function embedQuery(query: string) {
  return (await embed([query]))[0]!;
}
