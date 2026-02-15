import type { FlightInfo } from './flight'
import type { AccommodationInfo } from './accommodation'

export type SectionType = 'flight' | 'accommodation';

export interface FlightSectionData {
  type: 'flight';
  flights: FlightInfo[];
}

export interface AccommodationSectionData {
  type: 'accommodation';
  accommodations: AccommodationInfo[];
}

export type SectionData = FlightSectionData | AccommodationSectionData;

export interface PlanSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  data: SectionData;
}

export interface TravelPlan {
  id: string;
  accessCode: string;
  title: string;
  description: string;
  password: string;
  startDate: string;
  endDate: string;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
}
