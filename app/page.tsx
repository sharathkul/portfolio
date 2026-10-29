"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronDown, Pause, Play } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const linkedIn = "https://www.linkedin.com/in/sharathkulkarni/";
const SpatialSystem = dynamic(() => import("./components/SpatialSystem"), {
  ssr: false,
  loading: () => <div className="scene-loading" aria-hidden="true" />,
});

function SystemStage({ reducedMotion }: { reducedMotion: boolean }) {
  const [progress, setProgress] = useState(0);
  const [lens, setLens] = useState<"product" | "people">("product");

  useEffect(() => {
    if (reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: "#experience",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <div className="scene-rail">
      <div className="scene-sticky">
        <div className="scene-canvas" aria-hidden="true">
          <SpatialSystem
            progress={reducedMotion ? 0.35 : progress}
            lens={lens}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="lens-switch" aria-label="View the sculpture from a different perspective">
          <button type="button" onClick={() => setLens("product")} aria-pressed={lens === "product"}>
            Product
          </button>
          <button type="button" onClick={() => setLens("people")} aria-pressed={lens === "people"}>
            People
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleDetails({ children }: { children: React.ReactNode }) {
  return (
    <details className="role-details" onToggle={() => ScrollTrigger.refresh()}>
      <summary>More about my role <ChevronDown size={18} aria-hidden="true" /></summary>
      <div>{children}</div>
    </details>
  );
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
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
    document.documentElement.style.scrollBehavior = reducedMotion ? "auto" : "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from(".hero-title", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from(".hero-description, .hero-actions", {
        y: 14, opacity: 0, duration: 0.75, stagger: 0.1, delay: 0.2, ease: "power2.out",
      });
    }, root);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div ref={root} className={`portfolio-experience${reducedMotion ? " motion-reduced" : ""}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#main">Sharath Kulkarni</a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#journey">Journey</a>
          <a className="nav-contact" href={linkedIn} target="_blank" rel="noopener noreferrer">
            LinkedIn <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </nav>
        <button
          className="motion-toggle"
          type="button"
          aria-pressed={!reducedMotion}
          onClick={() => setMotionOverride(!reducedMotion)}
          aria-label={reducedMotion ? "Turn motion on" : "Pause motion"}
          title={reducedMotion ? "Turn motion on" : "Pause motion"}
        >
          {reducedMotion ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="experience-grid content-width" id="experience">
          <section className="opening" aria-labelledby="hero-title">
            <p className="hero-context">Healthcare product &amp; operations</p>
            <h1 className="hero-title" id="hero-title">I build where healthcare gets complicated.</h1>
            <p className="hero-description">
              I’m Sharath. At <a href="https://ncaremd.com/" target="_blank" rel="noopener noreferrer">nCare</a>,
              I lead product development and day-to-day operations across the US and India.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#work">See the work <ArrowDown size={19} aria-hidden="true" /></a>
              <a className="text-action" href={linkedIn} target="_blank" rel="noopener noreferrer">Let’s connect <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </section>
          <SystemStage reducedMotion={reducedMotion} />
          <div className="work-chapters" id="work">
            <section className="work-chapter" id="hemi" aria-labelledby="hemi-title">
              <h2 id="hemi-title">HEMI. From workflow to daily use.</h2>
              <p>I lead our internal healthcare platform from roadmap and workflow design to engineering, rollout, and adoption. The work spans desktop and mobile.</p>
              <p className="chapter-proof"><strong>200–250</strong><span>daily users</span></p>
              <RoleDetails>
                <p>I built and lead the engineering team, growing it from 3 to about 7–8. I work with the teams defining the workflows and stay involved through training, feedback, and daily use.</p>
              </RoleDetails>
            </section>
            <section className="work-chapter" id="operations" aria-labelledby="operations-title">
              <h2 id="operations-title">Leading the operation.</h2>
              <p>At nCare, I lead day-to-day operations below the CEO. Managers and team leads report to me across revenue cycle, care programs, and client delivery.</p>
              <p className="chapter-proof"><strong>~85</strong><span>people across the US and India</span></p>
              <RoleDetails>
                <p>I oversee a revenue cycle portfolio representing approximately $60–70M in annual collections, alongside care management, remote patient monitoring, and principal care management. I also helped establish and transition the India team.</p>
              </RoleDetails>
            </section>
            <section className="work-chapter" id="implementation" aria-labelledby="implementation-title">
              <h2 id="implementation-title">Getting clients up and running.</h2>
              <p>I lead implementations from workflow setup and training to go-live, and stay involved in demonstrations and account management.</p>
              <p className="chapter-proof"><strong>4</strong><span>external client implementations</span></p>
              <RoleDetails>
                <p>These are MSO and revenue cycle service implementations. I coordinate client teams, our internal platform, and the people delivering the service. The CEO leads lead generation, pricing, and closing.</p>
              </RoleDetails>
            </section>
          </div>
        </div>
        <section className="journey-section" id="journey" aria-labelledby="journey-title">
          <div className="journey-layout content-width">
            <div className="portrait">
              <Image src="/profile.jpg" alt="Sharath Kulkarni" width={600} height={720} sizes="(max-width: 700px) 240px, 30vw" />
            </div>
            <div className="journey-copy">
              <h2 id="journey-title">A different route into healthcare.</h2>
              <p>I started in brand at <a href="https://bbdo.com/" target="_blank" rel="noopener noreferrer">BBDO</a>, co-founded a business, and worked on <a href="https://www.juniper.net/us/en.html" target="_blank" rel="noopener noreferrer">Juniper’s</a> internal marketing portal.</p>
              <p>After my MBA, I joined <a href="https://www.thenephrologygroupinc.com/" target="_blank" rel="noopener noreferrer">The Nephrology Group</a> in 2023. My work grew into product and operating leadership at <a href="https://ncaremd.com/" target="_blank" rel="noopener noreferrer">nCare</a>.</p>
              <RoleDetails>
                <p>My formal roles are Business Intelligence &amp; Analytics Manager at The Nephrology Group and Product Operations Manager at nCare. Brand, websites, and demonstrations remain part of my work today.</p>
              </RoleDetails>
            </div>
          </div>
        </section>
        <section className="contact-section content-width" id="contact" aria-labelledby="contact-title">
          <h2 id="contact-title">What’s next in healthcare AI?</h2>
          <p>I’m interested in the products—and teams—that will make it work in practice.</p>
          <a className="primary-action" href={linkedIn} target="_blank" rel="noopener noreferrer">Let’s connect on LinkedIn <ArrowUpRight size={22} aria-hidden="true" /></a>
        </section>
      </main>
      <footer className="site-footer content-width"><span>Sharath Kulkarni</span><a href="#main">Back to top <ArrowUpRight size={17} aria-hidden="true" /></a></footer>
    </div>
  );
}
