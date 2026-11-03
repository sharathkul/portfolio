"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Plus, Pause, Play } from "lucide-react";
import JourneyMap from "./components/JourneyMap";
import StoryArt from "./components/StoryArt";
import StoryThread from "./components/StoryThread";
import SceneMotion from "./components/SceneMotion";
import HeroProfile from "./components/HeroProfile";

const linkedIn = "https://www.linkedin.com/in/sharathkulkarni/";
const chapters = [
  { id: "start", label: "Profile" },
  { id: "operations", label: "Healthcare AI" },
  { id: "building", label: "Building today" },
  { id: "clients", label: "Delivery" },
  { id: "journey", label: "Background" },
];

function Company({ href, children }: { href: string; children: ReactNode }) {
  return <a className="company-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}
function More({ children, label }: { children: ReactNode; label: string }) {
  return <details className="story-detail"><summary>{label}<Plus size={19} aria-hidden="true" /></summary><div>{children}</div></details>;
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [systemReduced, setSystemReduced] = useState(false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? systemReduced;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(media.matches);
    const update = () => setSystemReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const shell = root.current;
    if (!shell) return;
    const sections = chapters.map(chapter => document.getElementById(chapter.id));
    const progress = shell.querySelector<HTMLElement>(".reading-progress");
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let positions: number[] = [];
    let pageHeight = 1;
    let layoutWidth = window.innerWidth;

    const render = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const marker = window.scrollY + window.innerHeight * .55;
      let next = 0;
      positions.forEach((top, index) => { if (marker >= top) next = index; });
      setActive(previous => previous === next ? previous : next);
      const amount = Math.min(1, Math.max(0, window.scrollY / Math.max(1, pageHeight - window.innerHeight)));
      if (progress) progress.style.transform = `scaleX(${amount})`;
    };
    const request = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      const scroll = window.scrollY;
      positions = sections.map(section => (section?.getBoundingClientRect().top ?? 0) + scroll);
      pageHeight = shell.getBoundingClientRect().height;
      request();
    };
    const scheduleMeasure = () => {
      if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure);
    };
    const resize = () => {
      if (window.innerWidth !== layoutWidth) {
        layoutWidth = window.innerWidth;
        scheduleMeasure();
      } else request();
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(shell);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", request);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", request);
    };
  }, []);

  return (
    <div ref={root} className={`story-shell${reducedMotion ? " motion-reduced" : ""}`} data-active={active}>
      <a className="skip-link" href="#operations">Skip to my work</a>
      <header className="story-header">
        <a className="signature" href="#start">Sharath Kulkarni</a>
        <a className="header-contact" href={linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17} aria-hidden="true" /></a>
        <button type="button" className="motion-control"
          aria-label={reducedMotion ? "Turn motion on" : "Pause motion"}
          title={reducedMotion ? "Turn motion on" : "Pause motion"}
          onClick={() => setMotionOverride(!reducedMotion)}>
          {reducedMotion ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      </header>
      <main id="story">
        <SceneMotion reducedMotion={reducedMotion} />
        <StoryThread reducedMotion={reducedMotion} />
        <HeroProfile reducedMotion={reducedMotion} />
        <section className="story-part story-right" id="operations" aria-labelledby="operations-title">
          <StoryArt chapter="operations" />
          <div className="scene-copy">
            <h2 id="operations-title">Healthcare’s fragmentation has a cost.</h2>
            <p>Healthcare practices often run on disconnected systems. Clinical, operational and financial data sit in silos, making it hard to see where care, performance and revenue are falling short.</p>
            <p>Without that visibility, teams spend time piecing information together while missed work, delayed collections and lost revenue go unnoticed.</p>
            <p>Seeing those gaps firsthand at <Company href="https://www.thenephrologygroupinc.com/">The Nephrology Group</Company> shaped my focus: connect the data, make the problems visible and use AI and automation to help teams act.</p>
          </div>
        </section>
        <section className="story-part story-left" id="building" aria-labelledby="building-title">
          <StoryArt chapter="building" />
          <div className="scene-copy">
            <h2 id="building-title">An operation with a product team inside it.</h2>
            <p>At nCare, I set priorities across the operation and built the engineering team developing HEMI, our internal platform.</p>
            <p>I work with managers, team leads and engineers on where AI and automation fit, what to build next and how teams adopt it. HEMI is now part of daily operations, with product work across desktop and mobile.</p>
            <More label="Scope and responsibilities">
              <p>My formal roles are Product Operations Manager at nCare and Business Intelligence &amp; Analytics Manager at The Nephrology Group. I report to the CEO, with managers and team leads reporting to me.</p>
              <p>Operating responsibility includes care management, remote patient monitoring, principal care management, revenue cycle and client delivery. Product work includes prioritization, workflow design, engineering coordination, rollout and adoption.</p>
            </More>
          </div>
        </section>
        <section className="story-part story-right clients-part" id="clients" aria-labelledby="clients-title">
          <StoryArt chapter="clients" />
          <div className="scene-copy">
            <h2 id="clients-title">It has to work after the demo.</h2>
            <p>I’ve led nCare’s MSO and revenue cycle service implementations for four external client organizations, from setup and training to ongoing account management.</p>
            <More label="Demos, brand and communication">
              <p>I also lead demonstrations and nCare’s brand and website work, keeping how we present the service connected to what our teams deliver.</p>
            </More>
          </div>
        </section>
        <section className="story-part journey-part" id="journey" aria-labelledby="journey-title">
          <div className="journey-intro">
            <h2 id="journey-title">The experience behind the work.</h2>
            <p>A background across brand, business and technology, now focused on healthcare product and operations.</p>
          </div>
          <JourneyMap reducedMotion={reducedMotion} />
          <div className="conversation-close">
            <p>For conversations about healthcare AI, automation and the operations behind them.</p>
            <a href={linkedIn} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <ArrowUpRight size={22} aria-hidden="true" /></a>
          </div>
        </section>
      </main>
      <nav className="chapter-navigation" aria-label="Explore my current work">
        {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === index ? "location" : undefined}><span className="chapter-dot" aria-hidden="true" /><span>{chapter.label}</span></a>)}
      </nav>
      <div className="reading-track" aria-hidden="true"><div className="reading-progress" /></div>
    </div>
  );
}
