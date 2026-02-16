import { api, ApiError } from './client'
import type { ApiTravelPlan, ApiPlanSection } from './types'
import { mapApiPlanToDomain, mapApiSectionToDomain, mapDomainFlightToApi, mapDomainAccommodationToApi } from './mappers'
import type { TravelPlan, PlanSection, SectionType, FlightFormData, AccommodationInfo } from '@/types'
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

export interface UpdatePlanInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export async function updatePlan(accessCode: string, input: UpdatePlanInput): Promise<TravelPlan> {
  const token = useAuthStore.getState().getToken(accessCode)
  const data = await api.put<ApiTravelPlan>(`/plans/${accessCode}`, input, token)
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

export async function addSection(
  accessCode: string,
  title: string,
  sectionType: SectionType,
): Promise<PlanSection> {
  const token = useAuthStore.getState().getToken(accessCode)
  const apiType = sectionType.toUpperCase() as 'FLIGHT' | 'ACCOMMODATION'
  const data = await api.post<ApiPlanSection>(`/plans/${accessCode}/sections`, {
    title,
    sectionType: apiType,
  }, token)
  return mapApiSectionToDomain(data)
}

export interface UpdateSectionInput {
  title?: string;
  confirmed?: boolean;
  flightInfo?: Partial<FlightFormData>;
  accommodationInfo?: Partial<AccommodationInfo>;
}

export async function updateSection(
  accessCode: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<PlanSection> {
  const token = useAuthStore.getState().getToken(accessCode)
  const body: Record<string, unknown> = {}
  if (input.title !== undefined) body.title = input.title
  if (input.confirmed !== undefined) body.confirmed = input.confirmed
  if (input.flightInfo) body.flightInfo = mapDomainFlightToApi(input.flightInfo)
  if (input.accommodationInfo) body.accommodationInfo = mapDomainAccommodationToApi(input.accommodationInfo)

  const data = await api.put<ApiPlanSection>(`/plans/${accessCode}/sections/${sectionId}`, body, token)
  return mapApiSectionToDomain(data)
}

export async function reorderSections(accessCode: string, sectionIds: number[]): Promise<PlanSection[]> {
  const token = useAuthStore.getState().getToken(accessCode)
  const data = await api.put<ApiPlanSection[]>(`/plans/${accessCode}/sections/reorder`, { sectionIds }, token)
  return data.map(mapApiSectionToDomain)
}

export async function deleteSection(accessCode: string, sectionId: string): Promise<void> {
  const token = useAuthStore.getState().getToken(accessCode)
  await api.del(`/plans/${accessCode}/sections/${sectionId}`, token)
}
