"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import ProjectsGrid from "../ProjectsGrid";

export interface ProjectsGridWrapperProps {
  lang: string;
}

export default function ProjectsGridWrapper({ lang }: ProjectsGridWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <ProjectsGrid items={data.projects} />;
}
