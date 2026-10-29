"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowUpRight, ArrowRight, Pause, Play } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SpatialSystem = dynamic(() => import("./components/SpatialSystem"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading" aria-hidden="true">
      <div />
      <div />
      <div />
    </div>
  ),
});

function SystemStage({ reducedMotion }: { reducedMotion: boolean }) {
  const [progress, setProgress] = useState(0);
  const [lens, setLens] = useState<"product" | "people">("product");
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: "#experience",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setProgress(reducedMotion ? 0.26 : self.progress),
    });
    return () => trigger.kill();
  }, [reducedMotion]);
  const stage =
    progress < 0.25
      ? "The interface is one layer."
      : progress < 0.62
        ? "Open up the work behind it."
        : "A product. An operation. Real people.";
  return (
    <div className="scene-rail">
      <div className="scene-sticky">
        <div className="scene-topline">
          <span className="signal-dot" /> Inside the build{" "}
          <span className="scene-coordinate">SK / 2026</span>
        </div>
        <div className="scene-canvas">
          <SpatialSystem
            progress={progress}
            lens={lens}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="scene-interface">
          <p className="scene-caption" aria-live="polite">
            {lens === "people"
              ? "Every connection has people behind it."
              : stage}
          </p>
          <div
            className="lens-switch"
            aria-label="Explore the system from a different perspective"
          >
            <button
              type="button"
              onClick={() => setLens("product")}
              aria-pressed={lens === "product"}
            >
              Product
            </button>
            <button
              type="button"
              onClick={() => setLens("people")}
              aria-pressed={lens === "people"}
            >
              People
            </button>
          </div>
        </div>
        <p className="scene-note">
          Interactive system study. Illustrative layers, not HEMI product
          screens.
        </p>
      </div>
    </div>
  );
}

function CardVisual({
  kind,
}: {
  kind: "hemi" | "operations" | "implementation" | "brand";
}) {
  if (kind === "hemi")
    return (
      <div className="artifact-product" aria-hidden="true">
        <div className="artifact-plate artifact-plate-back">
          <span>Care programs</span>
          <i />
          <i />
          <i />
        </div>
        <div className="artifact-plate artifact-plate-mid">
          <span>Revenue operations</span>
          <div className="artifact-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="artifact-plate artifact-plate-front">
          <div className="artifact-toolbar">
            <b>HEMI</b>
            <span>Workflow study</span>
            <i />
          </div>
          <div className="artifact-board">
            <div>
              <b>Intake</b>
              <i />
              <i />
              <i />
            </div>
            <div>
              <b>In progress</b>
              <i />
              <i />
            </div>
            <div>
              <b>Complete</b>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    );
  if (kind === "operations")
    return (
      <div className="artifact-organization" aria-hidden="true">
        <div className="org-orbit org-orbit-one" />
        <div className="org-orbit org-orbit-two" />
        <div className="org-core">The work</div>
        <span className="org-node org-node-one">People</span>
        <span className="org-node org-node-two">Care</span>
        <span className="org-node org-node-three">Revenue</span>
        <span className="org-node org-node-four">Delivery</span>
      </div>
    );
  if (kind === "implementation")
    return (
      <div className="artifact-delivery" aria-hidden="true">
        {["Kickoff", "Configure", "Train", "Go live"].map((item, i) => (
          <div key={item} style={{ "--step": i } as React.CSSProperties}>
            <span>0{i + 1}</span>
            <b>{item}</b>
            <i />
            <i />
            <i />
          </div>
        ))}
      </div>
    );
  return (
    <div className="artifact-brand" aria-hidden="true">
      <span>Make it</span>
      <strong>
        make
        <br />
        sense.
      </strong>
      <div>Story / Design / Delivery</div>
    </div>
  );
}

function tilt(event: PointerEvent<HTMLAnchorElement>) {
  if (
    event.pointerType !== "mouse" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--rx",
    `${(-(event.clientY - rect.top - rect.height / 2) / rect.height) * 3}deg`,
  );
  event.currentTarget.style.setProperty(
    "--ry",
    `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 3}deg`,
  );
}

const selectedWork = [
  {
    slug: "hemi",
    kind: "hemi" as const,
    title: "From operating problem to internal platform.",
    discipline: "HEMI / Product, engineering & adoption",
    detail:
      "Roadmap to rollout. Desktop to mobile. Built for the teams using it every day.",
    scope: "200–250 actual daily users",
    span: "wide",
  },
  {
    slug: "operations",
    kind: "operations" as const,
    title: "Leading what happens around the product.",
    discipline: "nCare / People & operating systems",
    detail:
      "Care programs, revenue cycle, client delivery, and teams across the US and India.",
    scope: "About 85 people across operations",
    span: "",
  },
  {
    slug: "implementation",
    kind: "implementation" as const,
    title: "Making the handoff actually work.",
    discipline: "Client delivery / Implementation",
    detail:
      "Taking external client organizations from kickoff and workflow setup through go-live and training.",
    scope: "Four client organization implementations",
    span: "",
  },
  {
    slug: "brand",
    kind: "brand" as const,
    title: "The story is part of the product.",
    discipline: "Brand / Websites, demos & communication",
    detail:
      "Making a complex service understandable, from positioning and websites to the conversation in a demo.",
    scope: "An earlier foundation in brand and business",
    span: "wide brand-wide",
  },
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [systemReduced, setSystemReduced] = useState(false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? systemReduced;

  useEffect(() => {
    document.documentElement.style.scrollBehavior = reducedMotion
      ? "auto"
      : "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(media.matches);
    const update = () => setSystemReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from(".hero-title .line-inner", {
        yPercent: 112,
        rotate: 3,
        opacity: 0,
        duration: 1.05,
        stagger: 0.095,
        ease: "power3.out",
        delay: 0.08,
      });
      gsap.from(".hero-intro, .hero-actions, .hero-bottom", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.55,
        ease: "power2.out",
      });
      gsap.utils.toArray<HTMLElement>(".chapter-title").forEach((title) => {
        gsap.fromTo(
          title,
          { y: 40, opacity: 0.28 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: title,
              start: "top 87%",
              end: "top 42%",
              scrub: true,
            },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".work-visual").forEach((visual) => {
        gsap.fromTo(
          visual,
          { y: 38, rotateX: 7 },
          {
            y: -12,
            rotateX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
      gsap.fromTo(
        ".personal-image",
        { clipPath: "inset(16% 10% 16% 10% round 100px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 8px)",
          ease: "none",
          scrollTrigger: {
            trigger: "#story",
            start: "top 78%",
            end: "top 22%",
            scrub: 0.7,
          },
        },
      );
      gsap.fromTo(
        ".contact-title",
        { xPercent: -3 },
        {
          xPercent: 2,
          ease: "none",
          scrollTrigger: {
            trigger: "#contact",
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    }, root);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={root}
      className={`portfolio-experience${reducedMotion ? " motion-reduced" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Sharath Kulkarni home">
          <span className="brand-glyph" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Sharath Kulkarni</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#work">The work</a>
          <a href="#story">The person</a>
          <a href="#contact" className="nav-contact">
            Say hello <ArrowUpRight size={15} />
          </a>
        </nav>
        <button
          className="motion-toggle"
          type="button"
          aria-pressed={!reducedMotion}
          onClick={() => setMotionOverride(!reducedMotion)}
          aria-label={
            reducedMotion ? "Turn motion on" : "Pause ambient and scroll motion"
          }
        >
          {reducedMotion ? <Play size={12} /> : <Pause size={12} />}
          <span>Motion {reducedMotion ? "off" : "on"}</span>
        </button>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="experience-grid content-width" id="experience">
          <section className="opening" aria-labelledby="hero-title">
            <div className="hero-intro">
              <span className="signal-dot" />
              <span>Healthcare AI, product & operations</span>
            </div>
            <h1 className="hero-title" id="hero-title">
              <span className="line">
                <span className="line-inner">I build where</span>
              </span>
              <span className="line">
                <span className="line-inner">healthcare gets</span>
              </span>
              <span className="line">
                <span className="line-inner">complicated.</span>
              </span>
            </h1>
            <p className="hero-intro hero-description">
              I’m Sharath. I bring products, people, and the work in between
              into the same picture.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#operating-problem">
                <span>Come inside the build</span>
                <ArrowDown size={18} />
              </a>
              <a className="text-action" href="#work">
                Take the short route <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="hero-bottom">
              <span>
                Currently building at{" "}
                <a
                  href="https://ncaremd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  nCare <ArrowUpRight size={12} />
                </a>
              </span>
              <span className="scroll-cue">
                <i /> Scroll to explore
              </span>
            </div>
          </section>
          <SystemStage reducedMotion={reducedMotion} />
          <section
            className="story-chapter"
            id="operating-problem"
            aria-labelledby="problem-title"
          >
            <p className="chapter-position">
              <span>01</span> Start with the work
            </p>
            <h2 className="chapter-title" id="problem-title">
              The interesting
              <br />
              part is underneath.
            </h2>
            <p className="chapter-lead">
              The handoffs. The workarounds. The things that make perfect sense
              in a meeting and fall apart in a real workflow.
            </p>
            <p>
              Working inside healthcare means I see the product and the
              operation together. At nCare and The Nephrology Group, that spans
              care programs, revenue operations, engineering, and client
              delivery.
            </p>
            <a
              className="inline-link"
              href="https://ncaremd.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meet the company behind the work <ArrowUpRight size={17} />
            </a>
          </section>
          <section
            className="story-chapter"
            id="building-hemi"
            aria-labelledby="build-title"
          >
            <p className="chapter-position">
              <span>02</span> Turn it into a build
            </p>
            <h2 className="chapter-title" id="build-title">
              A platform.
              <br />
              And the team
              <br />
              to build it.
            </h2>
            <p className="chapter-lead">
              HEMI connects the product work to the operating environment I help
              lead.
            </p>
            <p>
              I lead the roadmap, workflows, engineering delivery,
              implementation, and adoption of the internal platform, including
              the mobile app work.
            </p>
            <div className="chapter-proof">
              <div>
                <strong>
                  3 <ArrowRight size={22} /> 7–8
                </strong>
                <span>Growth of the engineering team</span>
              </div>
              <div className="proof-thread">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <Link className="inline-link" href="/work/hemi">
              Go deeper into HEMI <ArrowUpRight size={17} />
            </Link>
          </section>
          <section
            className="story-chapter chapter-adoption"
            id="making-it-work"
            aria-labelledby="adoption-title"
          >
            <p className="chapter-position">
              <span>03</span> Take it into the operation
            </p>
            <h2 className="chapter-title" id="adoption-title">
              It has to work
              <br />
              after the demo.
            </h2>
            <p className="chapter-lead">
              That means rollout, training, feedback, and staying close to the
              teams using it every day.
            </p>
            <div className="adoption-proof">
              <strong>200–250</strong>
              <span>Actual daily HEMI users</span>
            </div>
            <p>
              My responsibility also extends to the people, care programs,
              revenue cycle operations, and client delivery around the platform.
            </p>
            <Link className="inline-link" href="/work/operations">
              Explore the operating side <ArrowUpRight size={17} />
            </Link>
          </section>
        </div>
        <section
          className="selected-work content-width"
          id="work"
          aria-labelledby="work-heading"
        >
          <div className="section-opening">
            <p className="section-kicker">Selected work</p>
            <h2 id="work-heading">
              Different sides.
              <br />
              Same builder.
            </h2>
            <p>
              Pick a thread. Explore how I connect product development, teams,
              and delivery.
            </p>
          </div>
          <div className="work-grid">
            {selectedWork.map((work, i) => (
              <Link
                key={work.slug}
                href={`/work/${work.slug}`}
                className={`work-card work-card--${work.kind} ${work.span}`}
                onPointerMove={reducedMotion ? undefined : tilt}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty("--rx", "0deg");
                  event.currentTarget.style.setProperty("--ry", "0deg");
                }}
              >
                <div className="work-top">
                  <span>{work.discipline}</span>
                  <span className="work-index">0{i + 1}</span>
                </div>
                <div className="work-visual">
                  <CardVisual kind={work.kind} />
                </div>
                <div className="work-copy">
                  <div>
                    <h3>{work.title}</h3>
                    <p>{work.detail}</p>
                  </div>
                  <span className="work-open" aria-label="Read case study">
                    <ArrowUpRight size={24} />
                  </span>
                </div>
                <div className="work-scope">
                  <span>{work.scope}</span>
                  <span>Explore the story</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="work-art-note">
            The visual studies illustrate the work. Case studies describe my
            actual responsibilities and scope.
          </p>
        </section>
        <section
          className="personal-section"
          id="story"
          aria-labelledby="personal-title"
        >
          <div className="content-width personal-grid">
            <div className="personal-visual">
              <div className="personal-image">
                <Image
                  src="/profile.jpg"
                  width={1728}
                  height={1228}
                  alt="Sharath Kulkarni"
                  sizes="(max-width: 760px) 85vw, 420px"
                />
              </div>
              <div className="personal-caption">
                <span>A little context</span>
                <span>Sharath Kulkarni</span>
              </div>
            </div>
            <div className="personal-copy">
              <p className="section-kicker">The person behind the work</p>
              <h2 id="personal-title">
                I came to healthcare
                <br />
                through a different door.
              </h2>
              <p className="personal-lead">
                Brand and marketing. Co-founding a business. An MBA. Then
                healthcare, where the problems rarely fit neatly inside one job
                description.
              </p>
              <p>
                That path is part of how I work. I care about the product, how
                people understand it, and what it takes to make it useful in
                practice.
              </p>
              <p>
                Today, that means moving between product decisions, engineering,
                operating teams, client conversations, and the story that
                connects them.
              </p>
              <div className="company-history">
                <a
                  href="https://bbdo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>BBDO</span>
                  <small>Brand & communication</small>
                  <ArrowUpRight size={15} />
                </a>
                <a
                  href="https://www.juniper.net/us/en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Juniper Networks</span>
                  <small>Marketing operations</small>
                  <ArrowUpRight size={15} />
                </a>
                <a
                  href="https://www.thenephrologygroupinc.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>The Nephrology Group</span>
                  <small>Data, technology & healthcare</small>
                  <ArrowUpRight size={15} />
                </a>
                <a
                  href="https://ncaremd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>nCare</span>
                  <small>Product & operating leadership</small>
                  <ArrowUpRight size={15} />
                </a>
              </div>
              <Link className="inline-link" href="/work/brand">
                Follow the earlier chapters <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <section
          className="contact-section content-width"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-prelude">
            <span className="signal-dot" />
            <p>For the next interesting problem.</p>
          </div>
          <h2 className="contact-title" id="contact-title">
            What are you
            <br />
            trying to make work?
          </h2>
          <div className="contact-bottom">
            <a className="contact-email" href="mailto:sharath.kul@gmail.com">
              Let’s talk <ArrowUpRight size={35} />
            </a>
            <p>
              Healthcare AI. A product that needs to become real.
              <br />A team that needs to make it happen.
            </p>
            <a
              className="inline-link"
              href="https://www.linkedin.com/in/sharathkulkarni/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find me on LinkedIn <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer content-width">
        <a className="wordmark" href="#main">
          <span className="brand-glyph" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Sharath Kulkarni
        </a>
        <span>Inside the build / 2026</span>
        <a href="mailto:sharath.kul@gmail.com">
          sharath.kul@gmail.com <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
