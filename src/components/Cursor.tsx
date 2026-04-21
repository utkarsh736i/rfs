"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia("(max-width: 768px)").matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const inner = ring.querySelector(".cursor-ring") as HTMLElement;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });

    function anim() {
      rx += (mx - rx) * .1; ry += (my - ry) * .1;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(anim);
    }
    anim();

    document.addEventListener("mouseover", (e) => {
      const el = e.target as HTMLElement;
      if (el.closest("a,button,input,select,textarea,.cursor-hover")) {
        inner.style.width = "56px"; inner.style.height = "56px";
        inner.style.borderColor = "rgba(0,212,232,.6)";
      } else {
        inner.style.width = "36px"; inner.style.height = "36px";
        inner.style.borderColor = "rgba(0,212,232,.4)";
      }
    });
  }, []);

  return (
    <>
      <div className="cursor" ref={dotRef}><div className="cursor-dot" /></div>
      <div className="cursor" ref={ringRef}><div className="cursor-ring" /></div>
    </>
  );
}
