"use client";

import { useId } from "react";
import { Devices, Engineering, Folder, Paper } from "./StoryShapes";
import styles from "./ConnectedStory.module.css";

export default function MobileStoryArt({ chapter }: { chapter: "operations" | "building" | "clients" }) {
  const id = `art-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="mobile-story-art" data-story-art aria-hidden="true">
      <svg viewBox="-255 -180 510 360" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${id}-paper`} x1="-60" y1="-70" x2="65" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffefa" /><stop offset="1" stopColor="#e7e8e6" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="-70" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e9edf5" /><stop offset=".5" stopColor="#c2ccdf" /><stop offset="1" stopColor="#9daac0" />
          </linearGradient>
          <linearGradient id={`${id}-cobalt`} x1="-60" y1="-45" x2="80" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6680db" /><stop offset=".5" stopColor="#3156ce" /><stop offset="1" stopColor="#29449a" />
          </linearGradient>
        </defs>
        <style>{`
          #${id} .${styles.paper}, #${id} .${styles.deviceFace} { fill: url(#${id}-paper); }
          #${id} .${styles.paperEdge}, #${id} .${styles.deviceEdge} { fill: url(#${id}-edge); }
          #${id} .${styles.bluePlate}, #${id} .${styles.folderFront} { fill: url(#${id}-cobalt); }
        `}</style>
        <g id={id}>
          {chapter === "operations" ? (
            <>
              <path className={styles.manualThread} d="M-184-44C-97-111 52-43 160-4M-32 86l30 27" />
              <Paper x={-106} y={-68} turn={-12} table />
              <Paper x={103} y={-20} turn={9} tinted />
              <Paper x={-22} y={100} turn={-4} />
            </>
          ) : chapter === "building" ? (
            <>
              <g className={styles.jointBranches} style={{ strokeDashoffset: 0 }}>
                <path d="M0 0Q-42-34-145-42M0 0Q42-34 140-42M0 0Q-2 65-8 82" pathLength="1" />
              </g>
              <Paper x={-145} y={-42} turn={-8} tinted />
              <Engineering x={140} y={-42} />
              <Devices x={-8} y={82} />
              <text className={styles.label} x="-145" y="-123" textAnchor="middle">Care</text>
              <text className={styles.label} x="145" y="-120" textAnchor="middle">Engineering</text>
              <text className={styles.label} x="-6" y="164" textAnchor="middle">Product</text>
            </>
          ) : (
            <>
              <Folder x={-140} y={-23} turn={-8} />
              <Folder x={140} y={24} turn={6} />
              <path className={styles.deliveryBase} d="M-72-20C-11-104 52 98 105 24" />
              <path className={styles.localThread} d="M-72-20C-11-104 52 98 105 24" />
              <text className={styles.label} x="-144" y="-128" textAnchor="middle">nCare</text>
              <text className={styles.label} x="145" y="142" textAnchor="middle">Client teams</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
