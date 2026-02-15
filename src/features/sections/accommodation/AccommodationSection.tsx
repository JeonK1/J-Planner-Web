import type { SectionRenderer } from '../types'
import { AccommodationDisplay } from './AccommodationDisplay'
import { AccommodationForm } from './AccommodationForm'

export const accommodationSectionRenderer: SectionRenderer = {
  type: 'accommodation',
  label: '숙소정보',
  DisplayComponent: AccommodationDisplay,
  FormComponent: AccommodationForm,
}
