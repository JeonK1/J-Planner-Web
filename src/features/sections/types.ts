import type { ComponentType } from 'react'
import type { SectionType, PlanSection } from '@/types'
import type { UpdateSectionInput } from '@/api'

export interface SectionDisplayProps {
  section: PlanSection;
}

export interface SectionFormProps {
  section: PlanSection;
  onSave: (input: UpdateSectionInput) => Promise<void>;
}

export interface SectionRenderer {
  type: SectionType;
  label: string;
  DisplayComponent: ComponentType<SectionDisplayProps>;
  FormComponent: ComponentType<SectionFormProps>;
}
