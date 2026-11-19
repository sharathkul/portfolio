"use client";

import { useId, useState } from "react";
import { Devices, Engineering, Paper, type StoryPalette } from "./StoryShapes";
import styles from "./ConnectedStory.module.css";
import motion from "./StoryArt.module.css";
import StorySculpture from "./StorySculpture";
import TileBridgeFallback from "./TileBridgeFallback";
import PracticeFolderFallback from "./PracticeFolderFallback";
import SceneReplay from "./SceneReplay";
import PaperRelayFallback from "./PaperRelayFallback";

function SceneThread({ chapter }: { chapter: "operations" | "building" | "clients" }) {
  return (
    <svg className={motion.plateThread} data-plate-layer="over" fill="none"
      preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {chapter === "building" && <defs>{Array.from({ length: 6 }, (_, i) => <path key={i} data-bridge-leg="" />)}</defs>}
      {chapter === "operations" && <defs>{[0, 1, 2, 3].map(i => <path key={i} data-paper-leg="" />)}</defs>}
      {chapter === "clients" && <defs>{[0, 1, 2, 3].map(i => <path key={i} data-practice-leg="" />)}</defs>}
      <path data-plate-edging="" stroke="var(--paper)" strokeWidth="4" strokeOpacity=".85"
        vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path className="story-thread-base" data-plate-base="" pathLength={1} />
      <path className="story-thread-drawn" data-plate-drawn="" />
    </svg>
  );
}

export default function StoryArt({ chapter, reducedMotion = false }: { chapter: "operations" | "building" | "clients"; reducedMotion?: boolean }) {
  const id = `art-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [sculptureReady, setSculptureReady] = useState(false);
  const palette: StoryPalette = {
    paper: `url(#${id}-paper)`,
    edge: `url(#${id}-edge)`,
    accent: `url(#${id}-accent)`,
  };

  return (
    <div id={{ building: "bridge", clients: "practice-handoff", operations: "paper-relay" }[chapter]}
      className={`story-art ${motion.scene}`} data-story-art data-scene={chapter} data-sculpture-ready={sculptureReady}
      role={chapter === "building" ? "img" : "group"}
      aria-label={chapter === "operations" ? "Paper chain reaction. The bead tips Care into Information, which pushes Billing over." : chapter === "clients" ? "Practice handoff. A card catches on the folder lip. Its weight pulls the feeder guide back, letting the same card slide through." : "Two tiles form a bridge. On the chip, three etched traces merge into one signal that travels to the screen."}>
      <div className={motion.plate}>
        <div className={motion.drawing} data-plate-drawing aria-hidden="true">
          <StorySculpture chapter={chapter} onReady={setSculptureReady} />
          <svg viewBox={chapter === "operations" ? "-255 -142 510 284" : "-255 -180 510 360"} fill="none" focusable="false">
            <defs>
              <linearGradient id={`${id}-paper`} x1="-60" y1="-70" x2="65" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffefa" /><stop offset="1" stopColor="#e7e8e6" />
              </linearGradient>
              <linearGradient id={`${id}-edge`} x1="0" y1="-70" x2="0" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e9ebed" /><stop offset=".5" stopColor="#c6ccd5" /><stop offset="1" stopColor="#98a3b4" />
              </linearGradient>
              <linearGradient id={`${id}-accent`} x1="-60" y1="-45" x2="80" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--accent-light)" /><stop offset=".5" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-shadow)" />
              </linearGradient>
            </defs>
            <g>
              {chapter === "operations" ? (
                <PaperRelayFallback />
              ) : chapter === "building" ? (
                <>
                  <g className={styles.jointBranches}>
                    <path className={`${motion.branch} ${motion.branchCare}`} d="M0 0Q-42-34-145-42" pathLength="1" />
                    <path className={`${motion.branch} ${motion.branchEngineering}`} d="M0 0Q42-34 140-42" pathLength="1" />
                    <path className={`${motion.branch} ${motion.branchProduct}`} d="M0 0Q-2 65-8 82" pathLength="1" />
                  </g>
                  <circle className={motion.junction} r="5" fill={palette.accent} />
                  <g className={motion.care} data-motion-part="care"><Paper x={-145} y={-42} turn={-8} tinted palette={palette} /></g>
                  <g className={motion.engineering} data-motion-part="engineering"><Engineering x={140} y={-42} palette={palette} /></g>
                  <g className={motion.product} data-motion-part="product"><Devices x={-8} y={82} palette={palette} /></g>
                  <TileBridgeFallback />
                </>
              ) : (
                <PracticeFolderFallback />
              )}
            </g>
          </svg>
        </div>
        <div className={motion.sculptureLabels} data-story-labels>
          {chapter === "operations" ? <><span>Care</span><span>Information</span><span>Billing</span>{!reducedMotion && <SceneReplay sceneName="paper" />}</>
            : chapter === "building" ? <><span>Care teams</span><span>Product &amp; AI</span><span>Engineering</span></>
              : <><span>Feeder</span>{!reducedMotion && <SceneReplay sceneName="practice" />}<span>Practice folder</span></>}
        </div>
      </div>
      <SceneThread chapter={chapter} />
    </div>
  );
}
