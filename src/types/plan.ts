import type { FlightInfo } from './flight'
import type { AccommodationInfo } from './accommodation'

export type SectionType = 'flight' | 'accommodation';

export interface PlanSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  flightInfo: FlightInfo | null;
  accommodationInfo: AccommodationInfo | null;
}

export interface TravelPlan {
  id: string;
  accessCode: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
}
