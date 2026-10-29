"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import HeroAtmosphere from "./HeroAtmosphere";
import styles from "./HeroProfile.module.css";

export default function HeroProfile({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className={styles.hero} id="start" aria-labelledby="intro-title">
      <HeroAtmosphere reducedMotion={reducedMotion} />
      <div className={`${styles.overview} profile-overview`}>
        <div className={`${styles.composition} portrait-composition`}>
          <div className={styles.backdrop} aria-hidden="true" />
          <div className={styles.foundation} aria-hidden="true" />
          <div className={`${styles.portrait} intro-portrait`}>
            <Image src="/visuals/sharath-cartoon.png" alt="Cartoon portrait of Sharath Kulkarni" fill preload unoptimized sizes="(max-width: 760px) 70vw, (max-width: 1100px) 40vw, 470px" />
          </div>
          <span className={styles.connector} data-connector-origin aria-hidden="true" />
        </div>
        <div className={`${styles.copy} introduction-copy`}>
          <h1 className={styles.name} id="intro-title">Sharath <span>Kulkarni.</span></h1>
          <p className={styles.bio}>At <a className="company-link" href="https://ncaremd.com/" target="_blank" rel="noopener noreferrer">nCare<ArrowUpRight size={16} aria-hidden="true" /></a>, I lead operations and the teams building the tools behind them. My work brings healthcare, product and engineering together, with a focus on AI and automation.</p>
          <a className={styles.explore} href="#operations">Explore my work <ArrowDown size={20} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
