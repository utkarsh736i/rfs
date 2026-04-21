"use client";
import { useEffect, useRef } from "react";

export default function NeuralCanvas({ opacity = 0.4 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number };
    let nodes: Node[] = [];
    let animId: number;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function makeNodes(n: number) {
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now() / 1000;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const a = (1 - dist / 160) * .18;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            const isPulse = dist < 100 && Math.sin(t * 2 + i) > .7;
            ctx.strokeStyle = isPulse ? `rgba(108,159,255,${a * 1.5})` : `rgba(0,212,232,${a})`;
            ctx.lineWidth = isPulse ? 1 : .5; ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += .02;
        const glow = Math.sin(n.pulse) * .5 + .5;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + glow * .4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,232,${.3 + glow * .4})`; ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    makeNodes(55);
    draw();
    window.addEventListener("resize", () => { resize(); makeNodes(55); });
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neuralCanvas"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity }}
    />
  );
}
