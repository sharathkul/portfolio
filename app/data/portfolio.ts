export type WorkCase = {
  slug: string;
  title: string;
  subtitle: string;
  organization: string;
  organizationUrl: string;
  discipline: string;
  summary: string;
  role: string;
  scope: string[];
  chapters: { heading: string; body: string[] }[];
  status: string;
};

export const workCases: WorkCase[] = [
  {
    slug: "hemi",
    title: "HEMI",
    subtitle: "A product built from inside the operation.",
    organization: "nCare",
    organizationUrl: "https://ncaremd.com/",
    discipline: "Product direction, engineering & adoption",
    summary:
      "An internal healthcare operations platform. I lead the work from roadmap and workflow design through engineering, implementation, and the people using it every day.",
    role: "Product Operations Manager, nCare",
    scope: [
      "Approximately 200–250 daily users",
      "Engineering team grew from 3 to about 7–8",
      "Roadmap, workflows, and engineering delivery",
      "Desktop platform, mobile app, and adoption",
    ],
    status: "Internal platform · In daily use",
    chapters: [
      {
        heading: "From operating needs to a product roadmap.",
        body: [
          "HEMI is the internal platform used within the healthcare operation I help lead. I work with managers and teams to understand their needs, then lead the roadmap and workflow design with engineering. My product responsibilities sit alongside the revenue cycle, care programs, and client delivery work that the operation runs.",
        ],
      },
      {
        heading: "Building the product meant building the team.",
        body: [
          "I built and now lead the engineering team, which grew from three people to approximately seven or eight. I set product direction and coordinate engineering delivery across the desktop platform and mobile app. The role connects the people defining the workflows with the team responsible for turning them into a working product.",
        ],
      },
      {
        heading: "Into daily use.",
        body: [
          "Approximately 200–250 people use HEMI daily. I lead implementation and work through rollout, training, feedback, and adoption with the teams using it. My involvement continues through the managers and operating teams I lead, keeping product delivery connected to the people responsible for the work each day.",
        ],
      },
    ],
  },
  {
    slug: "operations",
    title: "The operation",
    subtitle: "There are people behind every system.",
    organization: "nCare",
    organizationUrl: "https://ncaremd.com/",
    discipline: "Operating leadership & team building",
    summary:
      "I lead day-to-day operations below the CEO, connecting managers, teams, product, and client delivery across the US and India.",
    role: "Product Operations Manager, nCare",
    scope: [
      "Approximately 85 employees across the US and India",
      "Leads and managers report to me",
      "$60–70M annual collections portfolio under oversight",
      "Revenue cycle, care programs, and client delivery",
    ],
    status: "Current operating responsibility",
    chapters: [
      {
        heading: "My title is one line. The work connects many teams.",
        body: [
          "My formal title at nCare is Product Operations Manager. In practice, I am the most senior day-to-day operations leader below the CEO. The leads and managers come to me for the decisions and coordination involved in running the operation.",
          "That scope spans approximately 85 people across the US and India. I work across team leadership, revenue cycle operations, care management, remote patient monitoring, principal care management, and client delivery.",
        ],
      },
      {
        heading: "The numbers describe responsibility.",
        body: [
          "The revenue cycle portfolio I oversee represents approximately $60–70M in annual collections. My responsibilities connect that operating scope with team leadership, service delivery, and the systems supporting the work.",
          "Alongside revenue cycle work, I oversee teams involved in care management and the RPM and PCM programs. The role requires attention to how those responsibilities fit together with staffing, product, implementation, and the client relationship.",
        ],
      },
      {
        heading: "Building across two countries.",
        body: [
          "I helped establish and transition the India operating team. Today my responsibilities connect the US and India teams, including the managers and leads responsible for delivery.",
          "The engineering team sits within that broader picture. I have built its capacity while also leading the operation the product supports. Decisions about the team and decisions about the platform meet in the work I am responsible for each day.",
        ],
      },
      {
        heading: "This is where my product judgment comes from.",
        body: [
          "Leading the operation gives me a direct relationship with the people and workflows behind a product request. I work with managers and teams, translate needs into priorities with engineering, and stay involved when the product enters the workflow.",
          "I also hold the formal role of Business Intelligence & Analytics Manager at The Nephrology Group. Across these responsibilities, I have moved closer to the connection between information, product decisions, and how healthcare organizations actually run.",
        ],
      },
    ],
  },
  {
    slug: "implementation",
    title: "Into practice",
    subtitle: "A commitment becomes a working relationship.",
    organization: "nCare",
    organizationUrl: "https://ncaremd.com/",
    discipline: "Implementation, demonstrations & client delivery",
    summary:
      "Four external client organization implementations, with my involvement spanning demonstrations, workflow setup, go-live, training, and the continuing account relationship.",
    role: "Product Operations Manager, nCare",
    scope: [
      "Four external client organization implementations",
      "Kickoff, workflow setup, training, and go-live",
      "Demonstrations and account management",
      "MSO and revenue cycle service delivery",
    ],
    status: "External service implementations",
    chapters: [
      {
        heading: "The promise has to become something people can use.",
        body: [
          "I have led implementations for four external client organizations. My responsibility runs from kickoff and workflow setup through training and go-live, connecting the client organization with the operating teams delivering the service.",
          "These are MSO and revenue cycle service relationships. The work involves the internal platform and the people around it, with implementation making those pieces support the client’s workflows.",
        ],
      },
      {
        heading: "I am part of the conversation before implementation.",
        body: [
          "I handle demonstrations and support the conversations that help a prospective client understand the offering. I also lead marketing, brand, and website work that explains our services and what it means to work with us.",
          "The CEO leads lead generation, pricing, and closing. My contribution connects the demonstration and explanation of the service with the implementation and delivery responsibilities that follow.",
        ],
      },
      {
        heading: "Go-live belongs to a wider system.",
        body: [
          "The work I lead includes workflow setup, implementation coordination, training, and rollout. It requires bringing the client organization, the internal platform, and the service teams into the same working relationship.",
          "Because I also oversee day-to-day operations, I stay close to the team responsible for delivering after go-live. Implementation sits alongside product and operating leadership in my role, so the handoff remains connected to the work that follows.",
        ],
      },
      {
        heading: "The relationship continues.",
        body: [
          "Account management is part of my scope. I remain involved with clients after implementation, alongside responsibility for the teams and workflows supporting their services.",
          "What interests me is that full arc: making an offering understandable, taking it into an organization, helping people use it, and staying responsible for the relationship. It brings together the product, commercial, and operating sides of my work.",
        ],
      },
    ],
  },
  {
    slug: "brand",
    title: "Making it clear",
    subtitle: "The path from brand work to building healthcare products.",
    organization: "nCare",
    organizationUrl: "https://ncaremd.com/",
    discipline: "Brand, entrepreneurship & product experience",
    summary:
      "My path runs through advertising, co-founding a business, marketing operations, and healthcare. Today, those experiences meet in how I build products, lead operations, and explain the work.",
    role: "Product Operations Manager, nCare",
    scope: [
      "BBDO: Brand Associate, 2016–2017",
      "Business co-founder, 2018–2020",
      "Juniper Networks: Marketing Operations Intern, 2022",
      "Healthcare: The Nephrology Group and nCare",
    ],
    status: "Earlier chapters, connected to today",
    chapters: [
      {
        heading: "Brand work, close to the client.",
        body: [
          "I worked as a Brand Associate at BBDO from April 2016 to April 2017. My responsibilities included client and campaign coordination across teams, alongside work on brand launches in India. The role involved the practical work behind a campaign: connecting the client, the people developing it, and the teams bringing it to market.",
        ],
      },
      {
        heading: "Then I helped build a business.",
        body: [
          "From June 2018 to December 2020, I co-founded and helped run a business. My work spanned brand development, finance, client communications, sales and marketing, and partnerships. It gave me responsibility across several parts of the business at once, from how the offering was presented to the client relationships and operating work behind it.",
        ],
      },
      {
        heading: "A portal is a product experience, too.",
        body: [
          "During my MBA, which I completed between 2021 and 2023, I joined Juniper Networks as a Marketing Operations Intern from May to August 2022. I worked on redesigning a global internal marketing portal, using stakeholder research and analysis of Jira tickets to understand the experience and the work the portal needed to support.",
        ],
      },
      {
        heading: "Healthcare brought the pieces together.",
        body: [
          "I joined The Nephrology Group in August 2023, where my formal role is Business Intelligence & Analytics Manager. My responsibilities later expanded into nCare, where I am Product Operations Manager. Today that scope includes HEMI’s roadmap, engineering and adoption, alongside day-to-day operating leadership across the US and India.",
        ],
      },
      {
        heading: "Today, the story and the delivery meet.",
        body: [
          "I lead marketing, brand, and website work at nCare, handle demonstrations, and remain involved through implementation and account management. The experience of explaining the offering connects directly with my product and operating responsibilities. I work across how a client encounters the organization and how the teams deliver for them afterward.",
        ],
      },
    ],
  },
];
