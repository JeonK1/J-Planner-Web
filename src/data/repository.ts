import type { TravelPlan, PlanSection, SectionData } from '@/types'

export interface PlanRepository {
  getPlanByAccessCode(accessCode: string): Promise<TravelPlan | null>;
  getPlan(planId: string): Promise<TravelPlan | null>;
  savePlan(plan: TravelPlan): Promise<void>;
  deletePlan(planId: string): Promise<void>;
  planExistsByAccessCode(accessCode: string): Promise<boolean>;

  verifyPassword(planId: string, password: string): Promise<boolean>;

  updateSection(
    planId: string,
    sectionId: string,
    data: SectionData,
  ): Promise<void>;
  addSection(planId: string, section: PlanSection): Promise<void>;
  removeSection(planId: string, sectionId: string): Promise<void>;
}
