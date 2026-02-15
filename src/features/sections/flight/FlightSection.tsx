import type { SectionRenderer } from '../types'
import { FlightDisplay } from './FlightDisplay'
import { FlightForm } from './FlightForm'

export const flightSectionRenderer: SectionRenderer = {
  type: 'flight',
  label: '비행기정보',
  DisplayComponent: FlightDisplay,
  FormComponent: FlightForm,
}
