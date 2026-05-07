"use client";

import { useEffect, useRef } from "react";
import type { TranscriptResult } from "@/hooks/use-deepgram";

interface TranscriptDisplayProps {
  transcripts: TranscriptResult[];
  interimTranscript: TranscriptResult | null;
}

export function TranscriptDisplay({
  transcripts,
  interimTranscript,
}: TranscriptDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, interimTranscript]);

  const hasContent = transcripts.length > 0 || interimTranscript;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-6"
    >
      {!hasContent ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">
            Click the microphone button to start transcribing...
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {transcripts.map((result, index) => (
            <span key={index} className="text-foreground">
              {result.words.map((word, wordIndex) => (
                <span
                  key={`${index}-${wordIndex}`}
                  className="inline transition-colors duration-150"
                >
                  {word.punctuated_word || word.word}{" "}
                </span>
              ))}
            </span>
          ))}
          {interimTranscript && (
            <span className="text-muted-foreground">
              {interimTranscript.words.map((word, wordIndex) => (
                <span
                  key={`interim-${wordIndex}`}
                  className="inline animate-pulse"
                >
                  {word.punctuated_word || word.word}{" "}
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
