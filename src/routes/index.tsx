import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { CATEGORIES } from "@/lib/products";
import { hybridSearch, listIndex } from "@/lib/search.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const TITLE = "Hybrid Search Playground — Keyword + Vector Retrieval";
const DESCRIPTION =
  "Search a product catalog with combined BM25 keyword and embedding vector retrieval, filter by category, and inspect the vector store in 2D.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORY_COLORS: Record<string, string> = {
  Laptops: "var(--chart-1)",
  Audio: "var(--chart-2)",
  Wearables: "var(--chart-3)",
  Cameras: "var(--chart-4)",
  "Home Office": "var(--chart-5)",
  Kitchen: "var(--primary)",
};

function Index() {
  const [query, setQuery] = useState("noise cancelling headphones for travel");
  const [category, setCategory] = useState("All");
  const [alpha, setAlpha] = useState(0.6);

  const indexFn = useServerFn(listIndex);
  const searchFn = useServerFn(hybridSearch);

  const indexQuery = useQuery({
    queryKey: ["vector-index"],
    queryFn: () => indexFn(),
    staleTime: Infinity,
  });

  const search = useMutation({
    mutationFn: (vars: { query: string; category: string; alpha: number }) =>
      searchFn({ data: vars }),
  });

  const results = search.data?.results ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Retrieval demo
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Hybrid Search with Metadata Filtering
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A product catalog is chunked, embedded and indexed in a vector store. Queries are scored
          with BM25 keyword matching and cosine similarity over embeddings, then fused and filtered
          by product category metadata.
        </p>
      </header>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Query the index</CardTitle>
          <CardDescription>
            Adjust the blend between semantic and keyword relevance, and restrict retrieval to a
            category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_200px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) search.mutate({ query: query.trim(), category, alpha });
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. lightweight laptop with long battery life"
              aria-label="Search query"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Product category filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={search.isPending}>
              {search.isPending ? "Searching…" : "Search"}
            </Button>

            <div className="md:col-span-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Keyword (BM25)</span>
                <span className="font-medium text-foreground">
                  alpha = {alpha.toFixed(2)} ({Math.round(alpha * 100)}% vector)
                </span>
                <span>Vector (embeddings)</span>
              </div>
              <Slider
                className="mt-3"
                value={[alpha]}
                onValueChange={(v) => setAlpha(v[0] ?? 0.6)}
                min={0}
                max={1}
                step={0.05}
                aria-label="Hybrid weighting"
              />
            </div>
          </form>

          {search.isError && (
            <p className="mt-4 text-sm text-destructive">
              {(search.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Results</h2>
        {results.length === 0 && !search.isPending && (
          <p className="mt-2 text-sm text-muted-foreground">
            Run a search to see ranked documents.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {results.map((r, i) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                    <span className="text-sm font-semibold">{r.metadata.product}</span>
                    <Badge variant="secondary">{r.metadata.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {r.metadata.brand} · ${r.metadata.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-semibold tabular-nums">{r.score.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">relevance</div>
                  <div className="mt-2 text-xs font-mono text-muted-foreground">
                    vec {r.vectorScore.toFixed(3)} · bm25 {r.keywordScore.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">Vector store visualization</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {indexQuery.data
            ? `${indexQuery.data.length} indexed chunks · ${indexQuery.data[0]?.dims}-dimensional embeddings, projected to 2D with PCA.`
            : "Loading index…"}
        </p>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embedding space (2D projection)</CardTitle>
            </CardHeader>
            <CardContent>
              {indexQuery.data && <Scatter docs={indexQuery.data} highlight={results.map((r) => r.id)} />}
              <div className="mt-4 flex flex-wrap gap-3">
                {CATEGORIES.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c] }}
                    />
                    {c}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indexed chunks & metadata</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[420px] overflow-y-auto pr-1">
              <div className="space-y-3">
                {indexQuery.data?.map((d) => (
                  <div key={d.id} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                      <Badge variant="outline">{d.metadata.category}</Badge>
                      <span className="text-xs font-medium">{d.metadata.product}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {d.text}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                      [{d.preview.join(", ")}, … ] ({d.dims}d)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

type Doc = {
  id: string;
  metadata: { category: string; product: string };
  point: [number, number] | number[];
};

function Scatter({ docs, highlight }: { docs: Doc[]; highlight: string[] }) {
  const xs = docs.map((d) => d.point[0]);
  const ys = docs.map((d) => d.point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 30;
  const w = 460;
  const h = 340;
  const sx = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (w - pad * 2);
  const sy = (v: number) => h - pad - ((v - minY) / (maxY - minY || 1)) * (h - pad * 2);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-md border border-border bg-card">
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`h${i}`}
          x1={pad}
          x2={w - pad}
          y1={pad + (i * (h - pad * 2)) / 4}
          y2={pad + (i * (h - pad * 2)) / 4}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {docs.map((d) => {
        const on = highlight.includes(d.id);
        return (
          <g key={d.id}>
            <circle
              cx={sx(d.point[0])}
              cy={sy(d.point[1])}
              r={on ? 9 : 6}
              fill={CATEGORY_COLORS[d.metadata.category] ?? "var(--muted-foreground)"}
              fillOpacity={highlight.length && !on ? 0.28 : 0.9}
              stroke="var(--card)"
              strokeWidth={1.5}
            />
            <title>{`${d.metadata.product} — ${d.metadata.category}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
