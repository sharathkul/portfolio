"use client";

import { useId, useState } from "react";
import { Devices, Engineering, Folder, Paper, type StoryPalette } from "./StoryShapes";
import styles from "./ConnectedStory.module.css";
import motion from "./StoryArt.module.css";
import StorySculpture from "./StorySculpture";

function OperationPanel({ x, turn, kind, palette }: { x: number; turn: number; kind: "care" | "information" | "payment"; palette: StoryPalette }) {
  return (
    <g transform={`translate(${x} 0) rotate(${turn})`}>
      <g transform="matrix(.94 .20 -.22 .76 0 0)">
        <path className={styles.paperEdge} fill={palette.edge} d="M-49-64H34L49-49V64H-49Z" transform="translate(4 6)" />
        <path className={styles.paper} fill={palette.paper} d="M-49-64H34L49-49V64H-49Z" />
        <path className={styles.fold} d="M34-64v15h15" />
        {kind === "care" ? <path className={styles.panelMark} d="M-7-28H7V-7H28V7H7V28H-7V7H-28V-7H-7Z" />
          : kind === "information" ? <g className={styles.panelMark}><path d="M-27-24H26M-27-4H26M-27 16H10" /><path className={styles.panelRule} d="M-27 37H26" /></g>
            : <g className={styles.panelMark}><circle r="28" /><path d="M9-15C-12-23-21-1 0 1C21 3 12 25-9 17M0-24V25" /></g>}
      </g>
    </g>
  );
}

function Practice({ x, y, palette }: { x: number; y: number; palette: StoryPalette }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={styles.paperEdge} fill={palette.edge} d="M-27-29H27V30H-27Z" transform="translate(4 5)" />
      <path className={styles.paper} fill={palette.paper} d="M-27-29H27V30H-27Z" />
      <path className={styles.clinicRoof} d="M-31-29H31" />
      <path className={styles.clinicMark} d="M-11-16V0M-19-8H-3" />
      <path className={styles.clinicDoor} fill={palette.cobalt} d="M6 7H18V30H6Z" />
    </g>
  );
}

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
              <path className={styles.manualThread} d="M-155 30C-105 106-65 106 0 35C65 106 105 106 155 30" />
              <path className={`${styles.localThread} ${motion.operationTrace}`} d="M-155 30C-105 106-65 106 0 35C65 106 105 106 155 30" pathLength="1" />
              <g className={motion.paperLeft} data-motion-part="paper-left"><OperationPanel x={-155} turn={-10} kind="care" palette={palette} /></g>
              <g className={motion.paperBottom} data-motion-part="paper-bottom"><OperationPanel x={0} turn={3} kind="information" palette={palette} /></g>
              <g className={motion.paperRight} data-motion-part="paper-right"><OperationPanel x={155} turn={10} kind="payment" palette={palette} /></g>
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
            </>
          ) : (
            <>
              <path className={styles.deliveryBase} d="M-72-20C-11-104 52 98 105 24" />
              <path className={`${styles.localThread} ${motion.deliveryTrace}`} d="M-72-20C-11-104 52 98 105 24" pathLength="1" />
              <g className={motion.sourceFolder} data-motion-part="source-folder"><Folder x={-140} y={-23} turn={-8} palette={palette} /></g>
              <g className={motion.clientFolder} data-motion-part="client-folder"><g transform="translate(145 3)">
                <Practice x={-37} y={-37} palette={palette} />
                <Practice x={40} y={-48} palette={palette} />
                <Practice x={-34} y={44} palette={palette} />
                <Practice x={44} y={35} palette={palette} />
              </g></g>
              <g className={motion.packet} data-motion-part="packet" transform="translate(105 24)">
                <circle r="7" fill="#fffefa" stroke="#3156ce" strokeWidth="2" />
                <circle r="2.3" fill="#3156ce" />
              </g>
            </>
          )}
        </g>
      </svg>
      <div className={motion.sculptureLabels} data-story-labels>
        {chapter === "operations" ? <><span>Care</span><span>Information</span><span>Billing</span></>
          : chapter === "building" ? <><span>Care teams</span><span>Internal tools</span><span>Engineering</span></>
            : <><span>Implementation</span><span>Practice teams</span></>}
      </div>
    </div>
  );
}
