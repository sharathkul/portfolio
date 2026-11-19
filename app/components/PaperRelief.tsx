import { useId } from "react";
import styles from "./PaperRelief.module.css";

// One cutting die shapes the lip, cut edge and inset floor.
const aperture = "M69 354 C63 254 151 162 291 145 C422 129 488 70 638 65 C812 58 975 116 1034 223 C1075 298 1036 386 927 421 C848 446 787 407 714 425 C624 447 594 545 458 576 C303 610 144 544 90 447 C77 422 70 390 69 354Z";

export default function PaperRelief() {
  const id = useId();
  const die = `${id}-cut`;
  const opening = `${id}-opening`;
  const edge = `${id}-edge`;
  const floor = `${id}-floor`;

  return (
    <div className={styles.stage} aria-hidden="true">
      <svg className={styles.relief} viewBox="0 0 1120 650" focusable="false">
        <defs>
          <path id={die} d={aperture} />
          <clipPath id={opening}><use href={`#${die}`} /></clipPath>
          <linearGradient id={edge} x1="20%" y1="3%" x2="76%" y2="94%">
            <stop stopColor="var(--edge-deep)" />
            <stop offset=".48" stopColor="var(--edge-neutral)" />
            <stop offset="1" stopColor="var(--edge-lit)" />
          </linearGradient>
          <linearGradient id={floor} x1="10%" y1="0%" x2="72%" y2="86%">
            <stop stopColor="var(--floor-shade)" />
            <stop offset=".61" stopColor="var(--paper)" />
            <stop offset="1" stopColor="var(--floor-lit)" />
          </linearGradient>
        </defs>
        <use href={`#${die}`} className={styles.lip} />
        <g clipPath={`url(#${opening})`}>
          <use href={`#${die}`} fill={`url(#${edge})`} />
          <g className={styles.recess}>
            <use href={`#${die}`} className={styles.cutFace} />
            <use href={`#${die}`} className={styles.floor} fill={`url(#${floor})`} />
          </g>
        </g>
      </svg>
    </div>
  );
}
