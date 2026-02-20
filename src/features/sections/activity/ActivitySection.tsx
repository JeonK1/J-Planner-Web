import type { SectionRenderer } from '../types'
import { ActivityDisplay } from './ActivityDisplay'
import { ActivityForm } from './ActivityForm'

export const activitySectionRenderer: SectionRenderer = {
  type: 'activity',
  label: '액티비티정보',
  DisplayComponent: ActivityDisplay,
  FormComponent: ActivityForm,
}
