"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import JourneyMap from "./components/JourneyMap";
import StoryArt from "./components/StoryArt";
import StoryThread from "./components/StoryThread";
import SceneMotion from "./components/SceneMotion";
import HeroProfile from "./components/HeroProfile";
import ContactForm from "./components/ContactForm";
import BrandAtmosphere from "./components/BrandAtmosphere";

const chapters = [
  { id: "start", label: "Profile" },
  { id: "operations", label: "The problem" },
  { id: "building", label: "Building" },
  { id: "clients", label: "In practice" },
  { id: "journey", label: "Background" },
];

function Company({ href, children }: { href: string; children: ReactNode }) {
  return <a className="company-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
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
        <section className="story-part problem-part" id="operations" aria-labelledby="operations-title">
          <div className="problem-heading">
            <h2 id="operations-title">Disconnected systems make healthcare harder.</h2>
          </div>
          <StoryArt chapter="operations" reducedMotion={reducedMotion} />
          <div className="scene-copy">
            <p>Patient information, follow-up and billing often live in separate systems. People end up doing the connecting. Work gets repeated, priorities get buried and a practice can lose revenue without a clear view of why.</p>
            <p>Healthcare analytics was the starting point. Reporting made the gaps visible; getting closer to operations showed what it would take to close them. At <Company href="https://ncaremd.com/">nCare</Company>, I now oversee operations and the engineering team building our internal tools.</p>
          </div>
        </section>
        <section className="story-part story-left building-part" id="building" aria-labelledby="building-title">
          <StoryArt chapter="building" />
          <div className="scene-copy">
            <h2 id="building-title">Turning operational problems into software.</h2>
            <p>We built an internal platform for care and practice operations, with desktop and mobile tools. The roadmap grows out of the work: information teams need, decisions they make and handoffs that slow them down.</p>
            <p>Engineering stays close to the people using it. Daily use reveals the awkward steps a specification can miss. That feedback guides the next iteration, including where AI and automation could remove repetitive work and where a person still needs to make the call.</p>
          </div>
        </section>
        <section className="story-part clients-part" id="clients" aria-labelledby="clients-title">
          <div className="scene-copy delivery-copy">
            <h2 id="clients-title">Implementation is part of the design.</h2>
            <div className="delivery-body">
              <p>Care and billing services have to fit the systems, staff roles and routines already in place. During implementation, those constraints become concrete: who owns a task, where it happens and what the next team needs to know.</p>
              <p>A process can make sense on a screen and still get in someone’s way. Training and client conversations show where to clarify a step, revise a workflow or rethink the tool behind it.</p>
            </div>
          </div>
          <StoryArt chapter="clients" reducedMotion={reducedMotion} />
        </section>
        <section className="story-part journey-part" id="journey" aria-labelledby="journey-title">
          <div className="journey-intro">
            <h2 id="journey-title">How the pieces came together.</h2>
            <p>Brand work, running a business and exploring technology each brought a different way to understand a problem. Healthcare brought those threads together.</p>
          </div>
          <JourneyMap reducedMotion={reducedMotion} />
          <ContactForm reducedMotion={reducedMotion} />
        </section>
      </main>
      <nav className="chapter-navigation" aria-label="Explore the story">
        {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === index ? "location" : undefined}><span className="chapter-dot" aria-hidden="true" /><span>{chapter.label}</span></a>)}
      </nav>
      <div className="reading-track" aria-hidden="true"><div className="reading-progress" /></div>
    </div>
  );
}
