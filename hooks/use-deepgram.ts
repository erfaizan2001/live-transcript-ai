"use client";

import { useState, useCallback, useRef } from "react";

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface TranscriptResult {
  transcript: string;
  words: TranscriptWord[];
  isFinal: boolean;
  speechFinal: boolean;
}

export function useDeepgram() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptResult[]>([]);
  const [interimTranscript, setInterimTranscript] =
    useState<TranscriptResult | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);

      // Get API key from our backend
      const response = await fetch("/api/deepgram");
      const { key, error: apiError } = await response.json();

      if (apiError) {
        throw new Error(apiError);
      }

      // Connect to Deepgram WebSocket
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?" +
          new URLSearchParams({
            model: "nova-3",
            language: "multi",
            smart_format: "true",
            interim_results: "true",
            utterance_end_ms: "1000",
            vad_events: "true",
            endpointing: "300",
          }),
        ["token", key]
      );

      socket.onopen = () => {
        setIsConnected(true);
        startRecording();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "Results") {
          const alternative = data.channel?.alternatives?.[0];
          if (alternative) {
            const result: TranscriptResult = {
              transcript: alternative.transcript || "",
              words: alternative.words || [],
              isFinal: data.is_final,
              speechFinal: data.speech_final,
            };

            if (result.transcript) {
              if (result.isFinal) {
                setTranscripts((prev) => [...prev, result]);
                setInterimTranscript(null);
              } else {
                setInterimTranscript(result);
              }
            }
          }
        }
      };

      socket.onerror = () => {
        setError("WebSocket connection error");
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        setIsRecording(false);
      };

      socketRef.current = socket;

      async function startRecording() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          streamRef.current = stream;

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });

          mediaRecorder.ondataavailable = (event) => {
            if (
              event.data.size > 0 &&
              socket.readyState === WebSocket.OPEN
            ) {
              socket.send(event.data);
            }
          };

          mediaRecorder.start(250); // Send audio chunks every 250ms
          mediaRecorderRef.current = mediaRecorder;
          setIsRecording(true);
        } catch (err) {
          setError(
            "Microphone access denied. Please allow microphone access."
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsRecording(false);
    setIsConnected(false);
    setInterimTranscript(null);
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setInterimTranscript(null);
  }, []);

  return {
    isConnected,
    isRecording,
    error,
    transcripts,
    interimTranscript,
    connect,
    disconnect,
    clearTranscripts,
  };
}
