import styles from "./ConnectedStory.module.css";

export function Paper({ x = 0, y = 0, turn = 0, table = false, tinted = false }: {
  x?: number; y?: number; turn?: number; table?: boolean; tinted?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <g transform="matrix(.94 .20 -.22 .76 0 0)">
        <path className={styles.paperEdge} d="M-47-62H35L49-48V65H-47Z" transform="translate(4 5)" />
        <path className={tinted ? styles.tintedPaper : styles.paper} d="M-47-62H32L47-47V62H-47Z" />
        <path className={styles.fold} d="M32-62v15h15" />
        {table ? (
          <g className={styles.paperMark}>
            <path d="M-28-31H27V35H-28Z" />
            <path d="M-10-31V35M9-31V35M-28-9H27M-28 13H27" />
          </g>
        ) : (
          <g className={styles.paperMark}>
            <path d="M-27-27H21M-27-7H27M-27 13H13" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Folder({ x, y, turn = 0 }: { x: number; y: number; turn?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <g transform="matrix(.96 .20 -.23 .77 0 0)">
        <path className={styles.paperEdge} d="M-66-36H-17L-4-23H68V63H-66Z" transform="translate(3 7)" />
        <path className={styles.tintedPaper} d="M-66-36H-17L-4-23H68V63H-66Z" />
        <path className={styles.paper} d="M-45-59H46V31H-45Z" />
        <path className={styles.paperMark} d="M-27-37H28M-27-18H19" />
        <path className={styles.folderFront} d="M-71-7H72L62 67H-62Z" />
        <path className={styles.folderLip} d="M-71-7H72" />
      </g>
    </g>
  );
}

export function Devices({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="matrix(.94 .17 -.18 .79 0 0)">
        <path className={styles.deviceEdge} d="M-81-63H66V30H-81Z" transform="translate(5 5)" />
        <rect className={styles.deviceFace} x="-81" y="-63" width="147" height="93" rx="5" />
        <rect className={styles.deviceGlass} x="-72" y="-54" width="129" height="72" rx="1" />
        <path className={styles.deviceStand} d="M-13 31v23m-34 4h67" />
        <path className={styles.deviceEdge} d="M42-24H89V63H42Z" transform="translate(4 4)" />
        <rect className={styles.deviceFace} x="42" y="-24" width="47" height="87" rx="7" />
        <rect className={styles.deviceGlass} x="48" y="-14" width="35" height="64" rx="2" />
      </g>
    </g>
  );
}

export function Engineering({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="matrix(.94 .20 -.22 .76 0 0)">
        <path className={styles.blueEdge} d="M-58-45H58V45H-58Z" transform="translate(5 6)" />
        <path className={styles.bluePlate} d="M-58-45H58V45H-58Z" />
        <g className={styles.codeMark}>
          <path d="m-22-15-15 15 15 15m44-30 15 15-15 15M7-21-7 21" />
        </g>
      </g>
    </g>
  );
}
