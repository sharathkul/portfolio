"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import HeroAtmosphere from "./HeroAtmosphere";
import StorySculpture from "./StorySculpture";
import styles from "./HeroProfile.module.css";

export default function HeroProfile({ reducedMotion }: { reducedMotion: boolean }) {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <section className={styles.hero} id="start" aria-labelledby="intro-title">
      <HeroAtmosphere reducedMotion={reducedMotion || heroReady} />
      <div className={`${styles.overview} profile-overview`}>
        <div className={`${styles.composition} portrait-composition`} data-scene="hero" data-sculpture-ready={heroReady}>
          <div className={styles.backdrop} aria-hidden="true" />
          <div className={styles.foundation} aria-hidden="true" />
          <StorySculpture chapter="hero" onReady={setHeroReady} className={styles.portraitScene} />
          <div className={`${styles.portrait} intro-portrait`}>
            <Image src="/visuals/sharath-cartoon.png" alt="Cartoon portrait of Sharath Kulkarni" fill preload sizes="(max-width: 760px) 64vw, (max-width: 960px) 270px, (max-width: 1100px) 40vw, 470px" />
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
