"use client";

import { useDeepgram } from "@/hooks/use-deepgram";
import { TranscriptDisplay } from "./transcript-display";
import { RecordButton } from "./record-button";
import { AudioVisualizer } from "./audio-visualizer";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

export function LiveTranscript() {
  const {
    isConnected,
    isRecording,
    error,
    transcripts,
    interimTranscript,
    connect,
    disconnect,
    clearTranscripts,
  } = useDeepgram();

  const [copied, setCopied] = useState(false);

  const fullTranscript = transcripts
    .map((t) =>
      t.words.map((w) => w.punctuated_word || w.word).join(" ")
    )
    .join(" ");

  const handleCopy = async () => {
    if (fullTranscript) {
      await navigator.clipboard.writeText(fullTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fullTranscript) {
      const blob = new Blob([fullTranscript], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Live Transcript
              </h1>
              <p className="text-sm text-muted-foreground">
                Powered by Deepgram AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                }`}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Transcript Area */}
          <TranscriptDisplay
            transcripts={transcripts}
            interimTranscript={interimTranscript}
          />

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            {/* Audio Visualizer */}
            {isRecording && <AudioVisualizer isRecording={isRecording} />}

            {/* Main Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={clearTranscripts}
                disabled={transcripts.length === 0}
                title="Clear transcript"
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Clear transcript</span>
              </Button>

              <RecordButton
                isRecording={isRecording}
                isConnected={isConnected}
                onStart={connect}
                onStop={disconnect}
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={transcripts.length === 0}
                title="Copy transcript"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                <span className="sr-only">Copy transcript</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={transcripts.length === 0}
                title="Download transcript"
              >
                <Download className="h-5 w-5" />
                <span className="sr-only">Download transcript</span>
              </Button>
            </div>

            {/* Recording Status */}
            <p className="text-sm text-muted-foreground">
              {isRecording
                ? "Listening... Speak now"
                : "Press the microphone to start"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
