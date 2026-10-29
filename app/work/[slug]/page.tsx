import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { workCases } from "../../data/portfolio";
import "./case.css";

type CasePageProps = { params: Promise<{ slug: string }> };

const caseMaps: Record<string, { center: string; nodes: string[] }> = {
  hemi: {
    center: "HEMI",
    nodes: ["Product direction", "Engineering", "Implementation", "Adoption"],
  },
  operations: {
    center: "nCare",
    nodes: ["US + India", "Revenue cycle", "Care programs", "Client delivery"],
  },
  implementation: {
    center: "Go-live",
    nodes: ["Workflows", "Platform", "Training", "Client teams"],
  },
  brand: {
    center: "Clarity",
    nodes: ["Story", "Demonstrations", "Websites", "Experience"],
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={diagonal ? "case-arrow case-arrow-diagonal" : "case-arrow"}
    >
      <path
        d="M4 12h15M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function generateStaticParams() {
  return workCases.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = workCases.find((item) => item.slug === slug);
  if (!work) return { title: "Work not found | Sharath Kulkarni" };
  return {
    title: `${work.title} | Sharath Kulkarni`,
    description: work.summary,
    openGraph: {
      title: `${work.title}: ${work.subtitle}`,
      description: work.summary,
      type: "article",
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const workIndex = workCases.findIndex((item) => item.slug === slug);
  if (workIndex < 0) notFound();
  const work = workCases[workIndex];
  const nextWork = workCases[(workIndex + 1) % workCases.length];
  const map = caseMaps[work.slug];

  return (
    <div className={`case-page case-page-${work.slug}`}>
      <a className="case-skip" href="#case-content">
        Skip to the story
      </a>
      <header className="case-header">
        <nav className="case-header-inner" aria-label="Portfolio navigation">
          <Link href="/" className="case-home">
            Sharath Kulkarni<span aria-hidden="true"> /</span>
          </Link>
          <Link href="/#work" className="case-back">
            <span aria-hidden="true">↖</span> Back to the experience
          </Link>
        </nav>
      </header>

      <main id="case-content" className="case-main" tabIndex={-1}>
        <section className="case-hero" aria-labelledby="case-title">
          <div className="case-hero-context">
            <p className="case-discipline">{work.discipline}</p>
            <p className="case-status">
              <span aria-hidden="true" />
              {work.status}
            </p>
          </div>
          <h1 id="case-title" className="case-title">
            {work.title}
            <span aria-hidden="true">.</span>
          </h1>
          <div className="case-introduction">
            <h2 className="case-subtitle">{work.subtitle}</h2>
            <div className="case-introduction-copy">
              <p className="case-summary">{work.summary}</p>
              <a
                href={work.organizationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="case-company-link"
              >
                Visit {work.organization}
                <Arrow diagonal />
                <span className="case-sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </section>

        <section className="case-overview" aria-label="Scope of the work">
          <figure className="case-system">
            <div className="case-system-map" aria-hidden="true">
              <svg
                className="case-system-lines"
                viewBox="0 0 700 440"
                fill="none"
              >
                <ellipse cx="350" cy="220" rx="265" ry="148" />
                <ellipse cx="350" cy="220" rx="203" ry="113" />
                <path d="M350 64V376M80 220H620" />
                <path
                  className="case-system-current"
                  d="M350 72C496 72 615 138 615 220S496 368 350 368 85 302 85 220 204 72 350 72Z"
                />
              </svg>
              <div className="case-system-core">
                <span>{map.center}</span>
                <i />
                <i />
              </div>
              {map.nodes.map((node, index) => (
                <span
                  className={`case-system-node case-system-node-${index}`}
                  key={node}
                >
                  {node}
                </span>
              ))}
            </div>
            <figcaption className="case-system-caption">
              The connected parts of my responsibility.
            </figcaption>
          </figure>
          <div className="case-scope">
            <p className="case-role">{work.role}</p>
            <ul>
              {work.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="case-reading-layout">
          <aside className="case-contents">
            <p>Inside the work</p>
            <nav aria-label="Story chapters">
              {work.chapters.map((chapter, index) => (
                <a href={`#chapter-${index + 1}`} key={chapter.heading}>
                  {chapter.heading}
                </a>
              ))}
            </nav>
          </aside>
          <div className="case-story">
            {work.chapters.map((chapter, index) => (
              <section
                className="case-chapter"
                id={`chapter-${index + 1}`}
                key={chapter.heading}
                aria-labelledby={`chapter-title-${index + 1}`}
              >
                <h2 id={`chapter-title-${index + 1}`}>{chapter.heading}</h2>
                {chapter.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            {work.slug === "operations" && (
              <a
                className="case-inline-company"
                href="https://www.thenephrologygroupinc.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Nephrology Group
                <Arrow diagonal />
                <span className="case-sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {work.slug === "brand" && (
              <div
                className="case-earlier-links"
                aria-label="Earlier organizations"
              >
                <span>Earlier chapters</span>
                <a
                  href="https://bbdo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BBDO
                  <Arrow diagonal />
                  <span className="case-sr-only"> (opens in a new tab)</span>
                </a>
                <a
                  href="https://www.juniper.net/us/en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Juniper Networks
                  <Arrow diagonal />
                  <span className="case-sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <nav className="case-next" aria-label="More work">
          <p>There is more to the story.</p>
          <Link href={`/work/${nextWork.slug}`}>
            <span>{nextWork.title}</span>
            <Arrow />
          </Link>
          <p className="case-next-description">{nextWork.subtitle}</p>
        </nav>
      </main>

      <footer className="case-footer">
        <Link href="/#contact">
          Let’s talk about what comes next.
          <Arrow diagonal />
        </Link>
        <p>Sharath Kulkarni</p>
      </footer>
    </div>
  );
}
