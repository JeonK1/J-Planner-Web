import type { ComponentType } from 'react'
import type { SectionType, SectionData } from '@/types'

export interface SectionDisplayProps {
  data: SectionData;
}

export interface SectionFormProps {
  data: SectionData;
  onChange: (data: SectionData) => void;
}

export interface SectionRenderer {
  type: SectionType;
  label: string;
  DisplayComponent: ComponentType<SectionDisplayProps>;
  FormComponent: ComponentType<SectionFormProps>;
}
