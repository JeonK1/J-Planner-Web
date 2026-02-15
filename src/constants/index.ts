import type { TravelPlan } from '@/types'

export const STORAGE_KEY = 'j-planner-plans'

export const DEMO_PLAN: TravelPlan = {
  id: 'demo-plan-001',
  accessCode: 'DEMO',
  title: '일본 도쿄 여행 2026',
  description: '2026년 봄 도쿄 여행 계획',
  password: '1234',
  startDate: '2026-03-15',
  endDate: '2026-03-20',
  sections: [
    {
      id: 'section-flight-001',
      type: 'flight',
      title: '비행기정보',
      order: 0,
      data: {
        type: 'flight',
        flights: [
          {
            id: 'flight-001',
            airline: '대한항공',
            flightNumber: 'KE001',
            departureAirport: 'ICN',
            arrivalAirport: 'NRT',
            departureTime: '2026-03-15T09:00:00',
            arrivalTime: '2026-03-15T11:30:00',
            bookingReference: 'ABC123',
            notes: '인천공항 제2터미널',
          },
          {
            id: 'flight-002',
            airline: '대한항공',
            flightNumber: 'KE002',
            departureAirport: 'NRT',
            arrivalAirport: 'ICN',
            departureTime: '2026-03-20T18:00:00',
            arrivalTime: '2026-03-20T20:30:00',
            bookingReference: 'ABC124',
            notes: '나리타공항 제1터미널',
          },
        ],
      },
    },
    {
      id: 'section-accommodation-001',
      type: 'accommodation',
      title: '숙소정보',
      order: 1,
      data: {
        type: 'accommodation',
        accommodations: [
          {
            id: 'accommodation-001',
            name: '신주쿠 워싱턴 호텔',
            address: '3-2-9 Nishi-Shinjuku, Shinjuku-ku, Tokyo',
            checkIn: '2026-03-15',
            checkOut: '2026-03-18',
            bookingReference: 'HTL-001',
            contactNumber: '+81-3-1234-5678',
            notes: '체크인 15:00 이후',
          },
          {
            id: 'accommodation-002',
            name: '아사쿠사 료칸',
            address: '1-1-1 Asakusa, Taito-ku, Tokyo',
            checkIn: '2026-03-18',
            checkOut: '2026-03-20',
            bookingReference: 'HTL-002',
            contactNumber: '+81-3-8765-4321',
            notes: '조식 포함',
          },
        ],
      },
    },
  ],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
}
