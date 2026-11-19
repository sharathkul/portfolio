import { useId } from "react";

export default function ThreadOrb() {
  const id = `thread-orb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const groove = "M-7.9-3.2C-4.1-4.6 3.8-2.1 7.9 3.1";

  return (
    <g data-thread-orb="" visibility="hidden" pointerEvents="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-metal`} cx=".29" cy=".22" r=".84">
          <stop stopColor="#eff3f3" />
          <stop offset=".28" stopColor="#c5d2dc" />
          <stop offset=".52" stopColor="#95a9bd" />
          <stop offset=".7" stopColor="#667d98" />
          <stop offset=".88" stopColor="#354963" />
          <stop offset="1" stopColor="#778ba0" />
        </radialGradient>
        <linearGradient id={`${id}-bevel`} x2=".65" y2="1">
          <stop stopColor="#fcfaf4" />
          <stop offset=".34" stopColor="#b1c4d2" />
          <stop offset=".69" stopColor="#23334b" />
          <stop offset="1" stopColor="#8091a6" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#263b55" stopOpacity=".35" />
          <stop offset="1" stopColor="#263b55" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-surface`}><circle r="7.95" /></clipPath>
      </defs>
      <ellipse cx="1.8" cy="7.6" rx="9.2" ry="2.6" fill={`url(#${id}-shadow)`} />
      <circle r="8.9" fill={`url(#${id}-bevel)`} stroke="#f4f2ec" strokeWidth=".7" />
      <circle r="7.95" fill={`url(#${id}-metal)`} />
      <g data-orb-glint="" clipPath={`url(#${id}-surface)`} fill="none" strokeLinecap="round">
        <path d={groove} transform="translate(0 .65)" stroke="#d5dfe5" strokeWidth="1.35" />
        <path d={groove} stroke="#263b59" strokeWidth="1.7" />
        <path d="M-3.9-3.82Q-1.7-3.64-.2-3.19" stroke="#b9d0df" strokeWidth=".55" />
      </g>
    </g>
  );
}
