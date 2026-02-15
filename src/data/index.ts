import type { PlanRepository } from './repository'
import { LocalStorageRepository } from './localStorageRepository'

export const planRepository: PlanRepository = new LocalStorageRepository()

export type { PlanRepository } from './repository'
