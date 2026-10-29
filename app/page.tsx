import Image from "next/image";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="wrap">
          <nav className="nav" aria-label="Main navigation">
            <a className="identity" href="#main">
              Sharath Kulkarni
            </a>
            <div className="navlinks">
              <a href="#work">Selected work</a>
              <a href="#experience">Experience</a>
              <a href="#contact">Contact</a>
            </div>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="wrap">
          <section className="hero" aria-labelledby="intro-title">
            <div>
              <p className="intro-line">Healthcare product &amp; operations</p>
              <h1 id="intro-title">
                I build healthcare products and lead the teams that make them
                work.
              </h1>
              <p className="intro">
                I lead day-to-day operations at nCare, reporting to the CEO. My
                work connects product development, teams across the US and
                India, revenue cycle operations, and care programs.
              </p>
              <p className="intro">
                I stay involved from the first workflow conversation through
                engineering, implementation, and adoption.
              </p>
              <div className="hero-actions">
                <a className="button" href="#work">
                  Explore my work
                </a>
                <a
                  href="https://www.linkedin.com/in/sharathkulkarni/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect on LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
            <figure className="portrait">
              <Image
                src="/profile.jpg"
                alt="Sharath Kulkarni"
                width={1728}
                height={1228}
                sizes="(max-width: 600px) 105px, (max-width: 850px) 40vw, 420px"
                priority
              />
              <figcaption>
                Sharath Kulkarni
                <br />
                Building products from inside healthcare operations.
              </figcaption>
            </figure>
          </section>
          <div className="scope" aria-label="Current scope of responsibility">
            <p>
              <strong>About 85 people</strong>Across US and India operations,
              with leads and managers reporting to me.
            </p>
            <p>
              <strong>200–250 daily users</strong>Using HEMI, the internal
              platform I lead from roadmap through adoption.
            </p>
            <p>
              <strong>$60–70M in annual collections</strong>Across the revenue
              cycle portfolio I oversee.
            </p>
          </div>
          <section className="work" id="work" aria-labelledby="work-title">
            <div className="section-intro">
              <h2 id="work-title">Selected work</h2>
              <p>
                The product and the operation are closely connected in my work.
                I help define what needs to change, build the tools, and take
                responsibility for how the work runs afterward.
              </p>
            </div>
            <article className="case">
              <div>
                <p className="case-type">Product development &amp; adoption</p>
                <h3>HEMI: building around the people doing the work</h3>
                <p className="case-summary">
                  An internal healthcare operations platform, shaped alongside
                  the teams that use it.
                </p>
              </div>
              <div className="case-body">
                <p>
                  I lead HEMI’s roadmap, workflow design, engineering delivery,
                  implementation, and adoption. That means translating operating
                  needs into product decisions and staying close to the teams
                  using the platform every day.
                </p>
                <p className="evidence">
                  200–250 actual daily users · Engineering team grew from 3 to
                  about 7–8
                </p>
                <details>
                  <summary>What I’m responsible for</summary>
                  <div className="detail-content">
                    <dl className="responsibility">
                      <dt>Product direction</dt>
                      <dd>
                        Setting priorities, defining workflows, and deciding
                        what the team should build next.
                      </dd>
                    </dl>
                    <dl className="responsibility">
                      <dt>Delivery</dt>
                      <dd>
                        Building and leading the engineering team, coordinating
                        implementation, and leading the mobile app work.
                      </dd>
                    </dl>
                    <dl className="responsibility">
                      <dt>Adoption</dt>
                      <dd>
                        Working through training, rollout, and feedback from the
                        people using HEMI.
                      </dd>
                    </dl>
                    <p>
                      HEMI is an internal platform used in the operating
                      environment I help lead.
                    </p>
                  </div>
                </details>
              </div>
            </article>
            <article className="case">
              <div>
                <p className="case-type">Operations leadership</p>
                <h3>Leading the operation behind the platform</h3>
                <p className="case-summary">
                  People, revenue cycle, care programs, and client delivery
                  across the US and India.
                </p>
              </div>
              <div className="case-body">
                <p>
                  I’m the senior day-to-day operations leader below the CEO at
                  nCare. Leads and managers come to me for decisions across
                  revenue cycle operations, care management, remote patient
                  monitoring, principal care management, and client delivery.
                </p>
                <p className="evidence">
                  About 85 employees · $60–70M annual collections portfolio
                </p>
                <details>
                  <summary>How that connects to product</summary>
                  <div className="detail-content">
                    <p>
                      Leading the operation gives me direct access to the
                      problems the product needs to solve. I work with managers
                      and teams to understand the workflow, set priorities with
                      engineering, and support implementation.
                    </p>
                    <p>
                      I also helped establish and transition the India operating
                      team. The product work and the team structure need to
                      support the same operating goals.
                    </p>
                  </div>
                </details>
              </div>
            </article>
            <article className="case">
              <div>
                <p className="case-type">
                  Implementation &amp; client delivery
                </p>
                <h3>Taking client organizations from kickoff to go-live</h3>
                <p className="case-summary">
                  Turning a service commitment into workflows, training, and a
                  working client relationship.
                </p>
              </div>
              <div className="case-body">
                <p>
                  I’ve led implementation for four external client
                  organizations, from kickoff and workflow setup through go-live
                  and training. I handle demonstrations, account management, and
                  the marketing and website work that explains our services.
                </p>
                <p className="evidence">
                  Four external client organization implementations
                </p>
                <details>
                  <summary>My part in the client journey</summary>
                  <div className="detail-content">
                    <p>
                      I support the CEO’s sales conversations through
                      demonstrations and follow-up, then lead the work of
                      implementing and delivering services. The CEO leads lead
                      generation, pricing, and closing.
                    </p>
                    <p>
                      These are MSO and revenue cycle service relationships. My
                      work includes making the internal platform and operating
                      teams support that delivery.
                    </p>
                  </div>
                </details>
              </div>
            </article>
          </section>
        </div>
        <section className="approach" aria-labelledby="approach-title">
          <div className="wrap approach-inner">
            <h2 id="approach-title">Start with the work.</h2>
            <div>
              <p>
                I like getting close to a problem: talking to the people doing
                the work, understanding where it gets stuck, and building
                something they can use.
              </p>
              <p>
                That’s also how I approach AI. I start with the workflow and the
                people responsible for it, then decide where the technology
                belongs. My interest is in what a team can actually put into
                practice.
              </p>
            </div>
          </div>
        </section>
        <div className="wrap">
          <section
            className="experience"
            id="experience"
            aria-labelledby="experience-title"
          >
            <div className="experience-top">
              <h2 id="experience-title">Experience that connects the pieces</h2>
              <p>
                My path runs through brand and marketing, building a business,
                and healthcare operations. Today, I bring that experience to
                product development and team leadership.
              </p>
            </div>
            <div className="roles">
              <article className="role">
                <h3>nCare</h3>
                <p className="title">Product Operations Manager</p>
                <p>
                  Product development, operating teams, care programs,
                  implementations, and client delivery. I report to the CEO and
                  lead the day-to-day operation.
                </p>
              </article>
              <article className="role">
                <h3>The Nephrology Group</h3>
                <p className="title">
                  Business Intelligence &amp; Analytics Manager
                </p>
                <p>
                  I joined TNG in August 2023. My responsibilities expanded from
                  business intelligence and analytics into healthcare technology
                  and operating work.
                </p>
              </article>
              <article className="role">
                <h3>Juniper Networks</h3>
                <p className="title">Marketing Operations Intern</p>
                <p>
                  Worked on a global internal marketing portal, bringing
                  stakeholder research and analysis into the redesign.
                </p>
              </article>
              <article className="role">
                <h3>BBDO</h3>
                <p className="title">Brand Associate</p>
                <p>
                  Coordinated client and campaign work across teams, building an
                  early foundation in communication and execution.
                </p>
              </article>
            </div>
            <div className="earlier">
              <h3>Building a business</h3>
              <p>
                Before healthcare, I co-founded a business and worked across
                client relationships, brand, finance, sales, and day-to-day
                operations.
              </p>
            </div>
          </section>
        </div>
        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="wrap contact-inner">
            <h2 id="contact-title">Let’s talk.</h2>
            <div>
              <p>
                I’m interested in healthcare teams building useful products and
                making care delivery work better. If you’re working on a problem
                where product and operations need to move together, I’d like to
                hear about it.
              </p>
              <div className="contact-links">
                <a
                  href="https://www.linkedin.com/in/sharathkulkarni/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <p>Sharath Kulkarni</p>
            <p>Healthcare product &amp; operations</p>
          </div>
        </div>
      </footer>
    </>
  );
}
