"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
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
          <p className={styles.bio}>I work across healthcare, product and engineering, with a focus on AI and automation. I start with how people work, where things get stuck and what better tools could change.</p>
          <a className={styles.explore} href="#operations">Explore my work <ArrowDown size={20} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
