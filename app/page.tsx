"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Plus, Pause, Play } from "lucide-react";
import JourneyMap from "./components/JourneyMap";
import StoryArt from "./components/StoryArt";
import StoryThread from "./components/StoryThread";
import SceneMotion from "./components/SceneMotion";
import HeroProfile from "./components/HeroProfile";
import ContactForm from "./components/ContactForm";
import BrandAtmosphere from "./components/BrandAtmosphere";

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
      <BrandAtmosphere reducedMotion={reducedMotion} />
      <a className="skip-link" href="#operations">Skip to my work</a>
      <header className="story-header">
        <a className="signature" href="#start">Sharath Kulkarni</a>
        <a className="header-contact" href="#contact">Get in touch</a>
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
            <p>At <Company href="https://ncaremd.com/">nCare</Company>, I oversee operations across care programs, revenue cycle and client delivery, alongside the team building our internal tools. The aim is clearer visibility and less work spent moving information between systems.</p>
          </div>
        </section>
        <section className="story-part story-left" id="building" aria-labelledby="building-title">
          <StoryArt chapter="building" />
          <div className="scene-copy">
            <h2 id="building-title">Building from inside the operation.</h2>
            <p>HEMI is our internal platform for day-to-day work. I built the engineering team behind it and work across the roadmap, workflows and desktop and mobile experiences.</p>
            <p>Daily operations shape what we build, where automation fits and what needs a person’s judgment. I stay involved through implementation and adoption, so product decisions stay connected to how teams use the tools.</p>
            <More label="Behind the work">
              <p>I oversee care management, remote patient monitoring, principal care management and revenue cycle operations. That includes coordinating the teams delivering the services and the engineers building the tools behind them.</p>
            </More>
          </div>
        </section>
        <section className="story-part story-right clients-part" id="clients" aria-labelledby="clients-title">
          <StoryArt chapter="clients" />
          <div className="scene-copy">
            <h2 id="clients-title">It has to work after the demo.</h2>
            <p>I stay involved with practices using nCare’s services, from demos and implementation through training and ongoing account management. What we build has to hold up for the people delivering it and the clients relying on it.</p>
            <More label="Delivery and communication">
              <p>I’ve led MSO and revenue cycle implementations for four external client organizations. I also oversee nCare’s brand and website work, keeping how we present the services connected to what our teams deliver.</p>
            </More>
          </div>
        </section>
        <section className="story-part journey-part" id="journey" aria-labelledby="journey-title">
          <div className="journey-intro">
            <h2 id="journey-title">The experience behind the work.</h2>
            <p>Earlier work in brand, business and technology still shapes how I approach healthcare, product and operations today.</p>
          </div>
          <JourneyMap reducedMotion={reducedMotion} />
          <ContactForm />
        </section>
      </main>
      <nav className="chapter-navigation" aria-label="Explore my current work">
        {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === index ? "location" : undefined}><span className="chapter-dot" aria-hidden="true" /><span>{chapter.label}</span></a>)}
      </nav>
      <div className="reading-track" aria-hidden="true"><div className="reading-progress" /></div>
    </div>
  );
}
