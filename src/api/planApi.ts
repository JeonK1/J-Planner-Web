import { api, ApiError } from './client'
import type { ApiTravelPlan, ApiPlanSection } from './types'
import { mapApiPlanToDomain, mapApiSectionToDomain, mapDomainFlightToApi, mapDomainAccommodationToApi } from './mappers'
import type { TravelPlan, PlanSection, SectionType, FlightInfo, AccommodationInfo } from '@/types'

// --- Plan ---

export async function fetchPlanByAccessCode(accessCode: string): Promise<TravelPlan | null> {
  try {
    const data = await api.get<ApiTravelPlan>(`/plans?accessCode=${encodeURIComponent(accessCode)}`)
    return mapApiPlanToDomain(data)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function fetchPlan(planId: string): Promise<TravelPlan | null> {
  try {
    const data = await api.get<ApiTravelPlan>(`/plans/${planId}`)
    return mapApiPlanToDomain(data)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export interface CreatePlanInput {
  accessCode: string;
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

export async function updatePlan(planId: string, input: UpdatePlanInput): Promise<TravelPlan> {
  const data = await api.put<ApiTravelPlan>(`/plans/${planId}`, input)
  return mapApiPlanToDomain(data)
}

export async function deletePlan(planId: string): Promise<void> {
  await api.del(`/plans/${planId}`)
}

export async function checkAccessCodeExists(accessCode: string): Promise<boolean> {
  const data = await api.get<{ exists: boolean }>(`/plans/check-access-code?accessCode=${encodeURIComponent(accessCode)}`)
  return data.exists
}

export async function authenticatePlan(planId: string, password: string): Promise<boolean> {
  try {
    const data = await api.post<{ authenticated: boolean }>(`/plans/${planId}/auth`, { password })
    return data.authenticated
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return false
    throw e
  }
}

// --- Section ---

export async function addSection(
  planId: string,
  title: string,
  sectionType: SectionType,
): Promise<PlanSection> {
  const apiType = sectionType.toUpperCase() as 'FLIGHT' | 'ACCOMMODATION'
  const data = await api.post<ApiPlanSection>(`/plans/${planId}/sections`, {
    title,
    sectionType: apiType,
  })
  return mapApiSectionToDomain(data)
}

export interface UpdateSectionInput {
  title?: string;
  flightInfo?: Partial<FlightInfo>;
  accommodationInfo?: Partial<AccommodationInfo>;
}

export async function updateSection(
  planId: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<PlanSection> {
  const body: Record<string, unknown> = {}
  if (input.title !== undefined) body.title = input.title
  if (input.flightInfo) body.flightInfo = mapDomainFlightToApi(input.flightInfo)
  if (input.accommodationInfo) body.accommodationInfo = mapDomainAccommodationToApi(input.accommodationInfo)

  const data = await api.put<ApiPlanSection>(`/plans/${planId}/sections/${sectionId}`, body)
  return mapApiSectionToDomain(data)
}

export async function deleteSection(planId: string, sectionId: string): Promise<void> {
  await api.del(`/plans/${planId}/sections/${sectionId}`)
}
