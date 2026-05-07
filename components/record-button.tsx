"use client";

import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  isRecording: boolean;
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({
  isRecording,
  isConnected,
  onStart,
  onStop,
}: RecordButtonProps) {
  return (
    <Button
      size="lg"
      onClick={isRecording ? onStop : onStart}
      className={cn(
        "h-16 w-16 rounded-full transition-all duration-300",
        isRecording
          ? "bg-destructive hover:bg-destructive/90 animate-pulse"
          : "bg-primary hover:bg-primary/90"
      )}
    >
      {isRecording ? (
        <Square className="h-6 w-6 fill-current" />
      ) : isConnected ? (
        <MicOff className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
      <span className="sr-only">
        {isRecording ? "Stop recording" : "Start recording"}
      </span>
    </Button>
  );
}
