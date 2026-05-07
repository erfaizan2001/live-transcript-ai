"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
}

export function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear canvas when not recording
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    async function setupVisualizer() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
          if (!isRecording || !analyserRef.current) return;

          animationRef.current = requestAnimationFrame(draw);

          analyserRef.current.getByteFrequencyData(dataArray);

          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            // Use a cyan/teal color for the bars
            const hue = 180 + (i / bufferLength) * 30;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;

            ctx.fillRect(
              x,
              canvas.height - barHeight,
              barWidth - 1,
              barHeight
            );

            x += barWidth;
          }
        }

        draw();
      } catch (err) {
        console.error("Error setting up visualizer:", err);
      }
    }

    setupVisualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="w-full max-w-[300px] opacity-80"
    />
  );
}
