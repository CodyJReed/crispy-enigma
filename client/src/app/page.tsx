"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, FormEvent } from "react";
import { POST } from "./api/ask/route";
import { createCacheKey } from "next/dist/client/components/segment-cache-impl/cache-key";

type Answer = {
  summary: string;
  confidence: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleQuerySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();

    if (!q || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: q,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Request Failed");
      }

      const { summary, confidence } = data as Answer;

      setAnswers((prev) => [{ summary, confidence }, ...prev]);
      setQuery("");
      inputRef.current?.focus();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-zinc-200">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-24 pt-8">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Hello Agent - Ask anything?
          </h1>
        </header>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {answers.length === 0 && (
              <p className="text-sm text-zinc-600">No Answers</p>
            )}
            {answers.length > 0 && (
              <>
                {answers.map((answer, index) => (
                  <div key={index} className="rounded-xl border border-zinc-300 p-3">
                    <div className="text-sm leading-6">{answer.summary}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Confidence: {answer.confidence.toFixed(2)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
        <form
          onSubmit={handleQuerySubmit}
          className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-2xl p-4 backdrop-blur"
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type question here..."
              disabled={loading}
              className="h-11 bg-white"
            />
            <Button disabled={loading} type="submit" className="h-11">
              {loading ? "Thinking..." : "Ask"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
