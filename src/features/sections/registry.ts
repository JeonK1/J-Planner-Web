import type { SectionRenderer } from './types'
import type { SectionType } from '@/types'
import { flightSectionRenderer } from './flight/FlightSection'
import { accommodationSectionRenderer } from './accommodation/AccommodationSection'
import { activitySectionRenderer } from './activity/ActivitySection'

const sectionRegistry = new Map<SectionType, SectionRenderer>()

function registerSection(renderer: SectionRenderer): void {
  sectionRegistry.set(renderer.type, renderer)
}

export function getSectionRenderer(type: SectionType): SectionRenderer | undefined {
  return sectionRegistry.get(type)
}

export function getAllSectionRenderers(): SectionRenderer[] {
  return Array.from(sectionRegistry.values())
}

// 빌트인 섹션 등록
registerSection(flightSectionRenderer)
registerSection(accommodationSectionRenderer)
registerSection(activitySectionRenderer)
