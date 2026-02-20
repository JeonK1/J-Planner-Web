import type { FlightInfo } from './flight'
import type { AccommodationInfo } from './accommodation'
import type { ActivityInfo } from './activity'

export type SectionType = 'flight' | 'accommodation' | 'activity';

export interface PlanSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  confirmed: boolean;
  flightInfo: FlightInfo | null;
  accommodationInfo: AccommodationInfo | null;
  activityInfo: ActivityInfo | null;
}

export interface TravelPlan {
  accessCode: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
}
