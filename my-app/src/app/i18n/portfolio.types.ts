export interface Identity {
  name: string;
  role: string;
  location: string;
  timezone: string;
  email: string;
  phone: string;
  linkedin: string;
  site: string;
  statusLine: string;
  tagline: string;
  longBio: readonly string[];
  quickFacts: readonly (readonly string[])[];
}

export interface HeroCopy {
  ctaPrimary: string;
  ctaSecondary: string;
  ctaTertiary: string;
}

export interface SectionLabels {
  featured: string;
  projects: string;
  stack: string;
  experience: string;
  about: string;
  contact: string;
}

export interface FeaturedProject {
  id: string;
  n: string;
  title: string;
  kicker: string;
  year: string;
  role: string;
  stack: readonly string[];
  blurb: string;
  metrics: readonly (readonly string[])[];
  image: string;
  link: string;
}

export interface GridProject {
  id: string;
  n: string;
  title: string;
  kicker: string;
  stack: readonly string[];
  year: string;
}

export type StackEntry = readonly string[];
export type StackCategories = Readonly<Record<string, readonly StackEntry[]>>;

export interface ExperienceEntry {
  from: string;
  to: string;
  role: string;
  company: string;
  where: string;
  bullets: readonly string[];
}

export interface AboutCopy {
  heading: string;
  paragraphs: readonly string[];
}

export interface ContactFormLabels {
  name: string;
  subject: string;
  message: string;
}

export interface ContactCopy {
  heading: string;
  lead: string;
  formLabels: ContactFormLabels;
  submitLabel: string;
  successMsg: string;
  errorMsg: string;
}

export interface FooterCopy {
  rights: string;
  builtWith: string;
}

export interface PortfolioData {
  identity: Identity;
  hero: HeroCopy;
  sections: SectionLabels;
  featured: readonly FeaturedProject[];
  projects: readonly GridProject[];
  stack: StackCategories;
  experience: readonly ExperienceEntry[];
  about: AboutCopy;
  contact: ContactCopy;
  footer: FooterCopy;
}
