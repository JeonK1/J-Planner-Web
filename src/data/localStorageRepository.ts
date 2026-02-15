import type { TravelPlan, PlanSection, SectionData } from '@/types'
import type { PlanRepository } from './repository'
import { STORAGE_KEY, DEMO_PLAN } from '@/constants'

export class LocalStorageRepository implements PlanRepository {
  private getAll(): Record<string, TravelPlan> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial: Record<string, TravelPlan> = {
        [DEMO_PLAN.id]: DEMO_PLAN,
      }
      this.saveAll(initial)
      return initial
    }
    return JSON.parse(raw)
  }

  private saveAll(plans: Record<string, TravelPlan>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  }

  async getPlanByAccessCode(accessCode: string): Promise<TravelPlan | null> {
    const plans = this.getAll()
    const found = Object.values(plans).find(
      (p) => p.accessCode === accessCode,
    )
    return found ?? null
  }

  async getPlan(planId: string): Promise<TravelPlan | null> {
    const plans = this.getAll()
    return plans[planId] ?? null
  }

  async savePlan(plan: TravelPlan): Promise<void> {
    const plans = this.getAll()
    plans[plan.id] = { ...plan, updatedAt: new Date().toISOString() }
    this.saveAll(plans)
  }

  async deletePlan(planId: string): Promise<void> {
    const plans = this.getAll()
    delete plans[planId]
    this.saveAll(plans)
  }

  async planExistsByAccessCode(accessCode: string): Promise<boolean> {
    const plan = await this.getPlanByAccessCode(accessCode)
    return plan !== null
  }

  async verifyPassword(planId: string, password: string): Promise<boolean> {
    const plan = await this.getPlan(planId)
    if (!plan) return false
    return plan.password === password
  }

  async updateSection(
    planId: string,
    sectionId: string,
    data: SectionData,
  ): Promise<void> {
    const plans = this.getAll()
    const plan = plans[planId]
    if (!plan) return

    plan.sections = plan.sections.map((s) =>
      s.id === sectionId ? { ...s, data } : s,
    )
    plan.updatedAt = new Date().toISOString()
    this.saveAll(plans)
  }

  async addSection(planId: string, section: PlanSection): Promise<void> {
    const plans = this.getAll()
    const plan = plans[planId]
    if (!plan) return

    plan.sections.push(section)
    plan.updatedAt = new Date().toISOString()
    this.saveAll(plans)
  }

  async removeSection(planId: string, sectionId: string): Promise<void> {
    const plans = this.getAll()
    const plan = plans[planId]
    if (!plan) return

    plan.sections = plan.sections.filter((s) => s.id !== sectionId)
    plan.updatedAt = new Date().toISOString()
    this.saveAll(plans)
  }
}
