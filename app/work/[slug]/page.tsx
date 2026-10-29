import { notFound, permanentRedirect } from "next/navigation";

const sections: Record<string, string> = {
  hemi: "hemi",
  operations: "operations",
  implementation: "implementation",
  brand: "journey",
};

export function generateStaticParams() {
  return Object.keys(sections).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function FormerCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.prototype.hasOwnProperty.call(sections, slug)) notFound();
  permanentRedirect(`/#${sections[slug]}`);
}
