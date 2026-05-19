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
  tagHighlight: string;
  tagTrailing: string;
  longBio: readonly string[];
  quickFacts: readonly (readonly string[])[];
}

export interface HeroFact {
  label: string;
  value: string;
}

export interface HeroEnglishFact extends HeroFact {
  certificateUrl: string;
  certificateLabel: string;
}

export interface HeroFacts {
  role: HeroFact;
  based: HeroFact;
  english: HeroEnglishFact;
}

export interface HeroCopy {
  ctaPrimary: string;
  ctaSecondary: string;
  ctaTertiary: string;
  facts: HeroFacts;
}

export interface SectionLabels {
  featured: string;
  projects: string;
  stack: string;
  experience: string;
  about: string;
  contact: string;
}

export interface SectionHeaderCopy {
  index: string;
  kicker: string;
  title: string;
  hint?: string;
}

export interface ProjectsGridHeaderCopy {
  screenLabel: string;
  title: string;
  metaSuffix: string;
}

export interface StackHeaderCopy extends SectionHeaderCopy {
  screenLabel: string;
}

export interface ExperienceHeaderCopy extends StackHeaderCopy {
  hoverPrefix: string;
  highlightSingular: string;
  highlightPlural: string;
}

export interface SectionHeaders {
  featured: SectionHeaderCopy;
  projectsGrid: ProjectsGridHeaderCopy;
  stack: StackHeaderCopy;
  about: SectionHeaderCopy;
  experience: ExperienceHeaderCopy;
  contact: StackHeaderCopy;
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
  link?: string;
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

export type AboutCurrentlyTheme = "purple" | "aqua";

export interface AboutCurrentlyCopy {
  eyebrow: string;
  title: string;
  description: string;
  chips: readonly string[];
  theme: AboutCurrentlyTheme;
}

export interface AboutCopy {
  heading: string;
  paragraphs: readonly string[];
  currently: readonly AboutCurrentlyCopy[];
}

export interface ContactFormLabels {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormPlaceholders {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactToastCopy {
  success: string;
  error: string;
}

export interface ContactBookingCopy {
  eyebrow: string;
  title: string;
  lead: string;
}

export interface BookingModalCopy {
  eyebrow: string;
  localTimePrefix: string;
  timePickerLabel: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  privacyNote: string;
  confirmLabel: string;
  confirmingLabel: string;
  closeLabel: string;
  validationError: string;
  slotTakenError: string;
  fallbackError: string;
  successMsg: string;
  networkError: string;
}

export interface ContactCopy {
  heading: string;
  lead: string;
  formEyebrow: string;
  repliesBadge: string;
  formLabels: ContactFormLabels;
  formPlaceholders: ContactFormPlaceholders;
  submitLabel: string;
  submittingLabel: string;
  cooldownLabel: string;
  copyLabel: string;
  copiedLabel: string;
  successMsg: string;
  errorMsg: string;
  toast: ContactToastCopy;
  booking: ContactBookingCopy;
  bookingModal: BookingModalCopy;
  mapsUrl: string;
}

export interface FooterCopy {
  rights: string;
  builtWith: string;
}

export interface PortfolioData {
  identity: Identity;
  hero: HeroCopy;
  sections: SectionLabels;
  sectionHeaders: SectionHeaders;
  featuredViewLabel: string;
  featured: readonly FeaturedProject[];
  projects: readonly GridProject[];
  stack: StackCategories;
  experience: readonly ExperienceEntry[];
  about: AboutCopy;
  contact: ContactCopy;
  footer: FooterCopy;
}
