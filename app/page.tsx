"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Plus, Pause, Play } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JourneyMap from "./components/JourneyMap";
import StoryArtwork from "./components/StoryArtwork";

const linkedIn = "https://www.linkedin.com/in/sharathkulkarni/";
const chapters = [
  { id: "start", label: "Sharath" },
  { id: "operations", label: "Inside the work" },
  { id: "building", label: "Today" },
  { id: "clients", label: "Following through" },
  { id: "journey", label: "The whole picture" },
];

function Company({ href, children }: { href: string; children: ReactNode }) {
  return <a className="company-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}
function More({ children, label }: { children: ReactNode; label: string }) {
  return <details className="story-detail" onToggle={() => ScrollTrigger.refresh()}><summary>{label}<Plus size={19} aria-hidden="true" /></summary><div>{children}</div></details>;
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
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      chapters.forEach((chapter, index) => {
        ScrollTrigger.create({
          trigger: `#${chapter.id}`, start: "top 55%", end: "bottom 55%",
          onEnter: () => setActive(index), onEnterBack: () => setActive(index),
          onRefresh: (self) => { if (self.isActive) setActive(index); },
        });
      });
      gsap.to(".reading-progress", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: "#story", start: "top top", end: "bottom bottom", scrub: true },
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className={`story-shell${reducedMotion ? " motion-reduced" : ""}`} data-active={active}>
      <a className="skip-link" href="#operations">Skip to my work</a>
      <header className="story-header">
        <a className="signature" href="#start">Sharath Kulkarni</a>
        <a className="header-contact" href={linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17} aria-hidden="true" /></a>
        <button type="button" className="motion-control" aria-pressed={!reducedMotion}
          aria-label={reducedMotion ? "Turn motion on" : "Pause motion"}
          title={reducedMotion ? "Turn motion on" : "Pause motion"}
          onClick={() => setMotionOverride(!reducedMotion)}>
          {reducedMotion ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      </header>
      <div className="kinetic-stage" aria-hidden="true">
        <StoryArtwork active={active} reducedMotion={reducedMotion} />
      </div>
      <div className="story-word" aria-hidden="true">{["Sharath", "underneath", "building", "in practice", "connected"][active]}</div>
      <main id="story">
        <section className="story-part introduction" id="start" aria-labelledby="intro-title">
          <div className="intro-portrait"><Image src="/profile.jpg" alt="Sharath Kulkarni" fill preload unoptimized sizes="(max-width: 760px) 132px, 200px" /></div>
          <div className="introduction-copy">
            <h1 id="intro-title">I build where healthcare gets complicated.</h1>
            <p>I’m Sharath. I bring product, people, and the work in between into the same picture.</p>
          </div>
          <div className="present-day">
            <p>Today, I lead <Company href="https://ncaremd.com/">nCare’s</Company> operations. Care programs, revenue cycle, engineering, and client delivery meet in my day-to-day work.</p>
          </div>
          <a className="scroll-invitation" href="#operations">A little closer <ArrowDown size={18} aria-hidden="true" /></a>
        </section>
        <section className="story-part story-right" id="operations" aria-labelledby="operations-title">
          <div className="scene-copy">
            <h2 id="operations-title">The interesting part is underneath.</h2>
            <p>A practice can have plenty of software and still depend on spreadsheets, printouts, and manual handoffs. I saw that firsthand at <Company href="https://www.thenephrologygroupinc.com/">The Nephrology Group</Company>.</p>
            <p>Healthcare and software engineering were new territory. I learned the workflows with the people doing the work, then began connecting the reporting, processes, and product decisions around them.</p>
          </div>
        </section>
        <section className="story-part story-left" id="building" aria-labelledby="building-title">
          <div className="scene-copy">
            <h2 id="building-title">The work grew.<br />So did my responsibility.</h2>
            <p>I now lead nCare’s operations, with managers and team leads reporting to me. I connect decisions about people, care programs, revenue cycle, and client delivery with the systems supporting them.</p>
            <p>That includes the engineering team building HEMI, our internal platform. My work spans product priorities, workflow design, engineering delivery, and the desktop and mobile experience.</p>
            <More label="Inside the responsibility">
              <p>I built the engineering team and work across the roadmap, implementation, and adoption. The product decisions come from the operating needs I work with every day.</p>
              <p>Alongside that, I oversee care management, remote patient monitoring, principal care management, and revenue cycle operations. My formal roles are Product Operations Manager at nCare and Business Intelligence &amp; Analytics Manager at The Nephrology Group.</p>
            </More>
          </div>
        </section>
        <section className="story-part story-right clients-part" id="clients" aria-labelledby="clients-title">
          <div className="scene-copy">
            <h2 id="clients-title">It has to work after the demo.</h2>
            <p>For me, the build includes rollout, training, feedback, and adoption. I stay close to the teams using what we build.</p>
            <p>I’ve led implementations for external MSO and revenue cycle clients, from workflow setup through go-live and the ongoing account relationship.</p>
            <p>The same responsibility reaches into demonstrations, brand, and our websites: helping people understand what we offer, then making sure the experience holds together.</p>
            <More label="Client delivery and communication">
              <p>I’ve led implementations for four external client organizations and continue to handle account management. These are MSO and revenue cycle service relationships, supported by our people and internal platform.</p>
              <p>I lead the marketing, brand, and website work and handle demonstrations. That keeps the way we explain our services close to the teams delivering them.</p>
            </More>
          </div>
        </section>
        <section className="story-part journey-part" id="journey" aria-labelledby="journey-title">
          <div className="journey-intro">
            <h2 id="journey-title">A few chapters, connected.</h2>
            <p>I wanted to explore tech, so I moved to California. An MBA and a stint at <Company href="https://www.juniper.net/us/en.html">Juniper</Company> in the Bay Area brought me closer. That path eventually led me to healthcare, and to the work I do today.</p>
          </div>
          <JourneyMap reducedMotion={reducedMotion} />
          <div className="conversation-close">
            <p>If you’re building in healthcare AI, I’d like to hear what you’re working on.</p>
            <a href={linkedIn} target="_blank" rel="noopener noreferrer">Let’s connect on LinkedIn <ArrowUpRight size={22} aria-hidden="true" /></a>
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
