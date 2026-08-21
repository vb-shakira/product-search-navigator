import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  bm25Scores,
  cosine,
  embedQuery,
  getIndex,
  normalize,
} from "./search.server";

export const listIndex = createServerFn({ method: "GET" }).handler(async () => {
  const docs = await getIndex();
  return docs.map((d) => ({
    id: d.id,
    text: d.text,
    metadata: d.metadata,
    point: d.point,
    dims: d.embedding.length,
    preview: d.embedding.slice(0, 4).map((x) => Number(x.toFixed(4))),
  }));
});

export const hybridSearch = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        query: z.string().min(1).max(300),
        category: z.string().default("All"),
        alpha: z.number().min(0).max(1).default(0.6),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const all = await getIndex();
    const docs =
      data.category === "All"
        ? all
        : all.filter((d) => d.metadata.category === data.category);
    if (docs.length === 0) return { results: [] };

    const qVec = await embedQuery(data.query);
    const vector = docs.map((d) => cosine(qVec, d.embedding));
    const keyword = bm25Scores(data.query, docs);
    const nVector = normalize(vector);
    const nKeyword = normalize(keyword);

    const results = docs
      .map((d, i) => ({
        id: d.id,
        text: d.text,
        metadata: d.metadata,
        vectorScore: vector[i]!,
        keywordScore: keyword[i]!,
        score: data.alpha * nVector[i]! + (1 - data.alpha) * nKeyword[i]!,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return { results };
  });
