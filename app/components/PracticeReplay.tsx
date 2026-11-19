"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import styles from "./StoryArt.module.css";

export default function PracticeReplay() {
  const button = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<"ready" | "playing" | "paused">("ready");
  const toggle = useRef<() => void>(() => {});

  useEffect(() => {
    const element = button.current?.closest<HTMLElement>("[data-story-art]");
    if (!element) return;
    const scene = element;
    let frame = 0;
    let resumeAt = 0;
    const notify = () => scene.dispatchEvent(new Event("thread:replay-frame"));
    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
    function followScroll() {
      if (scene.dataset.practiceReplay === undefined) return;
      stop();
      resumeAt = 0;
      setMode("ready");
      delete scene.dataset.practiceReplay;
      notify();
    }
    toggle.current = () => {
      if (frame) {
        stop();
        resumeAt = Number(scene.dataset.practiceReplay ?? 0);
        setMode("paused");
        return;
      }
      const began = performance.now() - resumeAt * 5400;
      setMode("playing");
      const tick = (now: number) => {
        // Keep the final bead just inside the drawing until reading resumes.
        const p = Math.min(.997, (now - began) / 5400);
        scene.dataset.practiceReplay = String(p);
        notify();
        if (p < .997) frame = requestAnimationFrame(tick);
        else { stop(); resumeAt = 0; setMode("ready"); }
      };
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => { if (document.hidden) followScroll(); };
    window.addEventListener("scroll", followScroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", followScroll);
      document.removeEventListener("visibilitychange", visibility);
      delete scene.dataset.practiceReplay;
      notify();
    };
  }, []);

  const label = { ready: "Replay", playing: "Pause", paused: "Resume" }[mode];
  const Icon = { ready: RotateCcw, playing: Pause, paused: Play }[mode];
  return <button ref={button} type="button" className={styles.replay}
    data-practice-play="" aria-label={`${label} the practice handoff`}
    onClick={() => toggle.current()}>
    <Icon size={14} aria-hidden="true" />{label}
  </button>;
}
