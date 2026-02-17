import { api, ApiError } from './client'
import type { ApiTravelPlan, ApiPlanSection } from './types'
import { mapApiPlanToDomain, mapApiSectionToDomain, mapDomainFlightToApi, mapDomainAccommodationToApi } from './mappers'
import type { TravelPlan, PlanSection, FlightFormData, AccommodationInfo } from '@/types'
import { useAuthStore } from '@/stores/useAuthStore'

// --- Plan ---

export async function fetchPlan(accessCode: string): Promise<TravelPlan | null> {
  try {
    const data = await api.get<ApiTravelPlan>(`/plans/${encodeURIComponent(accessCode)}`)
    return mapApiPlanToDomain(data)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export interface CreatePlanInput {
  password: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export async function createPlan(input: CreatePlanInput): Promise<TravelPlan> {
  const data = await api.post<ApiTravelPlan>('/plans', input)
  return mapApiPlanToDomain(data)
}

export interface PatchPlanSectionInput {
  id: string;
  title?: string;
  confirmed?: boolean;
  flightInfo?: Partial<FlightFormData>;
  accommodationInfo?: Partial<AccommodationInfo>;
}

export interface NewSectionInput {
  sectionType: 'FLIGHT' | 'ACCOMMODATION';
  title: string;
  confirmed: boolean;
  flightInfo?: ReturnType<typeof mapDomainFlightToApi>;
  accommodationInfo?: ReturnType<typeof mapDomainAccommodationToApi>;
}

export interface PatchPlanInput {
  plan?: Partial<Pick<TravelPlan, 'title' | 'description' | 'startDate' | 'endDate'>>;
  sections?: PatchPlanSectionInput[];
  newSections?: NewSectionInput[];
  deletedSectionIds?: number[];
}

export async function patchPlan(accessCode: string, input: PatchPlanInput): Promise<TravelPlan> {
  const token = useAuthStore.getState().getToken(accessCode)
  const body: Record<string, unknown> = {}

  if (input.plan) {
    body.plan = input.plan
  }

  if (input.sections && input.sections.length > 0) {
    body.sections = input.sections.map((s) => {
      const section: Record<string, unknown> = { id: Number(s.id) }
      if (s.title !== undefined) section.title = s.title
      if (s.confirmed !== undefined) section.confirmed = s.confirmed
      if (s.flightInfo) section.flightInfo = mapDomainFlightToApi(s.flightInfo)
      if (s.accommodationInfo) section.accommodationInfo = mapDomainAccommodationToApi(s.accommodationInfo)
      return section
    })
  }

  if (input.newSections && input.newSections.length > 0) {
    body.newSections = input.newSections
  }

  if (input.deletedSectionIds && input.deletedSectionIds.length > 0) {
    body.deletedSectionIds = input.deletedSectionIds
  }

  const data = await api.patch<ApiTravelPlan>(`/plans/${accessCode}`, body, token)
  return mapApiPlanToDomain(data)
}

export async function deletePlan(accessCode: string): Promise<void> {
  const token = useAuthStore.getState().getToken(accessCode)
  await api.del(`/plans/${accessCode}`, token)
}

export async function authenticatePlan(accessCode: string, password: string): Promise<string | null> {
  try {
    const data = await api.post<{ authenticated: boolean; token: string }>(`/plans/${accessCode}/auth`, { password })
    return data.authenticated ? data.token : null
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}

// --- Section ---

export async function reorderSections(accessCode: string, sectionIds: number[]): Promise<PlanSection[]> {
  const token = useAuthStore.getState().getToken(accessCode)
  const data = await api.put<ApiPlanSection[]>(`/plans/${accessCode}/sections/reorder`, { sectionIds }, token)
  return data.map(mapApiSectionToDomain)
}

