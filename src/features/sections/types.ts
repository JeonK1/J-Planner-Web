import type { ComponentType } from 'react'
import type { SectionType, PlanSection } from '@/types'

export interface SectionDisplayProps {
  section: PlanSection;
}

export interface SectionFormProps {
  section: PlanSection;
  sectionId: string;
}

export interface SectionRenderer {
  type: SectionType;
  label: string;
  DisplayComponent: ComponentType<SectionDisplayProps>;
  FormComponent: ComponentType<SectionFormProps>;
}
