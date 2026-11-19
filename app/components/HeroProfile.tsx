import Image from "next/image";
import styles from "./HeroProfile.module.css";

export default function HeroProfile({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className={styles.hero} id="start" aria-labelledby="intro-title">
      <div className={`${styles.overview} profile-overview`}>
        <div
          className={`${styles.composition} portrait-composition`}
          data-scene="hero"
          data-reduced-motion={reducedMotion}
        >
          <div className={styles.print}>
            <div className={`${styles.portrait} intro-portrait`}>
              <Image
                src="/visuals/sharath-cartoon.png"
                alt="Illustrated portrait of Sharath Kulkarni"
                fill
                preload
                sizes="(max-width: 600px) 55vw, (max-width: 960px) 260px, 350px"
              />
            </div>
            <svg className={styles.monogram} viewBox="0 0 76 42" aria-hidden="true" focusable="false">
              <path d="M33 11C32 4 12 6 9 15C6 22 27 17 27 23C28 30 12 35 5 31M23 29C31 27 38 23 43 18" />
              <path d="M42 7C40 14 36 25 34 32M56 5C49 12 43 17 38 20C44 20 47 25 52 28C58 32 63 31 70 28" />
            </svg>
          </div>
          <span className={styles.connector} data-connector-origin aria-hidden="true" />
        </div>
        <div className={`${styles.copy} introduction-copy`}>
          <h1 className={styles.name} id="intro-title"><span>Sharath</span>{" "}<span>Kulkarni.</span></h1>
          <p className={styles.headline}>Making healthcare easier to work in.</p>
          <a className={styles.explore} href="#operations" aria-label="Explore the story">
            <svg viewBox="0 0 26 32" fill="none" aria-hidden="true" focusable="false">
              <path d="M13 3v24m-7-7 7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
