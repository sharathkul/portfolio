"use client";

import { useId, useState } from "react";
import { Devices, Engineering, Folder, Paper, type StoryPalette } from "./StoryShapes";
import styles from "./ConnectedStory.module.css";
import motion from "./StoryArt.module.css";
import StorySculpture from "./StorySculpture";

export default function StoryArt({ chapter }: { chapter: "operations" | "building" | "clients" }) {
  const id = `art-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [sculptureReady, setSculptureReady] = useState(false);
  const palette: StoryPalette = {
    paper: `url(#${id}-paper)`,
    edge: `url(#${id}-edge)`,
    cobalt: `url(#${id}-cobalt)`,
  };

  return (
    <div className={`story-art ${motion.scene}`} data-story-art data-scene={chapter} data-sculpture-ready={sculptureReady} aria-hidden="true">
      <StorySculpture chapter={chapter} onReady={setSculptureReady} />
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
        <g>
          {chapter === "operations" ? (
            <>
              <path className={styles.manualThread} d="M-184-44C-97-111 52-43 160-4M-32 86l30 27" />
              <g className={motion.paperLeft} data-motion-part="paper-left"><Paper x={-106} y={-68} turn={-12} table palette={palette} /></g>
              <g className={motion.paperRight} data-motion-part="paper-right"><Paper x={103} y={-20} turn={9} tinted palette={palette} /></g>
              <g className={motion.paperBottom} data-motion-part="paper-bottom"><Paper x={-22} y={100} turn={-4} palette={palette} /></g>
            </>
          ) : chapter === "building" ? (
            <>
              <g className={styles.jointBranches}>
                <path className={`${motion.branch} ${motion.branchCare}`} d="M0 0Q-42-34-145-42" pathLength="1" />
                <path className={`${motion.branch} ${motion.branchEngineering}`} d="M0 0Q42-34 140-42" pathLength="1" />
                <path className={`${motion.branch} ${motion.branchProduct}`} d="M0 0Q-2 65-8 82" pathLength="1" />
              </g>
              <circle className={motion.junction} r="5" fill={palette.cobalt} />
              <g className={motion.care} data-motion-part="care"><Paper x={-145} y={-42} turn={-8} tinted palette={palette} /></g>
              <g className={motion.engineering} data-motion-part="engineering"><Engineering x={140} y={-42} palette={palette} /></g>
              <g className={motion.product} data-motion-part="product"><Devices x={-8} y={82} palette={palette} /></g>
              <text className={styles.label} x="-145" y="-123" textAnchor="middle">Care</text>
              <text className={styles.label} x="145" y="-120" textAnchor="middle">Engineering</text>
              <text className={styles.label} x="-6" y="164" textAnchor="middle">Product</text>
            </>
          ) : (
            <>
              <path className={styles.deliveryBase} d="M-72-20C-11-104 52 98 105 24" />
              <path className={`${styles.localThread} ${motion.deliveryTrace}`} d="M-72-20C-11-104 52 98 105 24" pathLength="1" />
              <g className={motion.sourceFolder} data-motion-part="source-folder"><Folder x={-140} y={-23} turn={-8} palette={palette} /></g>
              <g className={motion.clientFolder} data-motion-part="client-folder"><Folder x={140} y={24} turn={6} palette={palette} /></g>
              <g className={motion.packet} data-motion-part="packet" transform="translate(105 24)">
                <circle r="7" fill="#fffefa" stroke="#3156ce" strokeWidth="2" />
                <circle r="2.3" fill="#3156ce" />
              </g>
              <text className={styles.label} x="-144" y="-128" textAnchor="middle">nCare</text>
              <text className={styles.label} x="145" y="142" textAnchor="middle">Client teams</text>
            </>
          )}
        </g>
      </svg>
      {chapter !== "operations" ? <div className={motion.sculptureLabels}>
        {chapter === "building" ? <><span>Care</span><span>Product</span><span>Engineering</span></> : <><span>nCare</span><span>Client teams</span></>}
      </div> : null}
    </div>
  );
}
