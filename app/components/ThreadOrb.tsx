import { useId } from "react";

export default function ThreadOrb() {
  const id = `thread-bead-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const bore = "translate(.45 .15) rotate(-28)";
  const opening = <ellipse transform={bore} cx="-.16" cy=".38" rx="4.28" ry="2.7" />;

  return (
    <g data-thread-orb="" visibility="hidden" pointerEvents="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-steel`} x1=".1" y1=".06" x2=".84" y2=".95">
          <stop stopColor="#718299" />
          <stop offset=".15" stopColor="#c2ccd1" />
          <stop offset=".27" stopColor="#f0eee4" />
          <stop offset=".42" stopColor="#aab6bf" />
          <stop offset=".56" stopColor="#748798" />
          <stop offset=".79" stopColor="#30465c" />
          <stop offset=".94" stopColor="#53677b" />
          <stop offset="1" stopColor="#a5adb0" />
        </linearGradient>
        <linearGradient id={`${id}-cut`} x1=".2" y1="0" x2=".64" y2="1">
          <stop stopColor="#182b3a" />
          <stop offset=".37" stopColor="#405267" />
          <stop offset=".68" stopColor="#ac9f87" />
          <stop offset="1" stopColor="#e6d8b9" />
        </linearGradient>
        <mask id={`${id}-opening`} maskUnits="userSpaceOnUse" x="-12" y="-12" width="24" height="24">
          <rect x="-12" y="-12" width="24" height="24" fill="white" />
          <g fill="black">{opening}</g>
        </mask>
        <clipPath id={`${id}-rim`}>
          <path fillRule="evenodd" clipRule="evenodd" d="M8.6 0A8.6 8.6 0 1 0-8.6 0A8.6 8.6 0 1 0 8.6 0ZM7.1 0A7.1 7.1 0 1 0-7.1 0A7.1 7.1 0 1 0 7.1 0Z" />
        </clipPath>
      </defs>
      <ellipse cx="1.15" cy="7.85" rx="6.75" ry="1.15" fill="#253950" opacity=".16" />
      <g mask={`url(#${id}-opening)`}>
        <circle r="8.63" fill={`url(#${id}-steel)`} stroke="#46586a" strokeWidth=".54" />
        <g data-orb-glint="" clipPath={`url(#${id}-rim)`} fill="none" strokeLinecap="round">
          <path d="M-8.5 2.7a8.8 8.8 0 0 1 1.55-7.95" stroke="#f4efe4" strokeWidth="1.12" />
          <path d="m5.7 5.25 1.35 1.25" stroke="#c3c6bc" strokeWidth=".8" />
        </g>
        <g transform={bore}>
          <ellipse rx="5.68" ry="4.48" fill="#e1e2d7" />
          <ellipse cy="-.16" rx="5.41" ry="4.06" fill={`url(#${id}-cut)`} />
          <ellipse cx="-.16" cy=".38" rx="4.4" ry="2.88" fill="#2e4052" />
        </g>
      </g>
    </g>
  );
}
