import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import type { TravelPlan, PlanSection } from '@/types'

interface PlanTimelineProps {
  plan: TravelPlan;
}

type TimelineEvent = {
  id: string;
  type: 'flight' | 'accommodation';
  label: string;
  startMs: number;
  endMs: number;
}

type FlightRow = {
  sectionId: string;
  segments: TimelineEvent[];
}

const DAY_WIDTH = 80
const DAY_MS = 24 * 60 * 60 * 1000
const PADDING_DAYS = 14
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function extractFlightRows(sections: PlanSection[]): FlightRow[] {
  const rows: FlightRow[] = []

  for (const section of sections) {
    if (section.type !== 'flight' || !section.flightInfo) continue
    const f = section.flightInfo
    const dep = parseDate(f.departureTime)
    const arr = parseDate(f.arrivalTime)
    if (!dep || !arr) continue

    const segments: TimelineEvent[] = [{
      id: `${section.id}-outbound`,
      type: 'flight',
      label: f.flightNumber || f.airline || section.title,
      startMs: dep.getTime(),
      endMs: arr.getTime(),
    }]

    if (f.tripType === 'roundTrip') {
      const rDep = parseDate(f.returnDepartureTime ?? '')
      const rArr = parseDate(f.returnArrivalTime ?? '')
      if (rDep && rArr) {
        segments.push({
          id: `${section.id}-return`,
          type: 'flight',
          label: f.returnFlightNumber || f.returnAirline || section.title,
          startMs: rDep.getTime(),
          endMs: rArr.getTime(),
        })
      }
    }

    rows.push({ sectionId: section.id, segments })
  }

  return rows
}

function extractAccEvents(sections: PlanSection[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const section of sections) {
    if (section.type !== 'accommodation' || !section.accommodationInfo) continue
    const a = section.accommodationInfo
    const checkIn = parseDate(a.checkIn)
    const checkOut = parseDate(a.checkOut)
    if (!checkIn || !checkOut) continue

    events.push({
      id: `${section.id}-acc`,
      type: 'accommodation',
      label: a.name || section.title,
      startMs: checkIn.getTime(),
      endMs: checkOut.getTime(),
    })
  }

  return events
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function getDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isInRange(day: Date, start: Date, end: Date): boolean {
  const d = day.getTime()
  return d >= start.getTime() && d <= end.getTime()
}

export function PlanTimeline({ plan }: PlanTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ startX: 0, scrollLeft: 0 })
  const hasScrolled = useRef(false)

  const planStart = useMemo(() => parseDate(plan.startDate), [plan.startDate])
  const planEnd = useMemo(() => parseDate(plan.endDate), [plan.endDate])

  const timelineStart = useMemo(() => {
    if (!planStart) return null
    return addDays(planStart, -PADDING_DAYS)
  }, [planStart])

  const timelineEnd = useMemo(() => {
    if (!planEnd) return null
    return addDays(planEnd, PADDING_DAYS)
  }, [planEnd])

  const days = useMemo(() => {
    if (!timelineStart || !timelineEnd) return []
    return getDaysBetween(timelineStart, timelineEnd)
  }, [timelineStart, timelineEnd])

  const flightRows = useMemo(() => extractFlightRows(plan.sections), [plan.sections])
  const accEvents = useMemo(() => extractAccEvents(plan.sections), [plan.sections])

  const today = useMemo(() => new Date(), [])

  const timelineStartMs = timelineStart?.getTime() ?? 0
  const totalMs = days.length * DAY_MS
  const totalWidth = days.length * DAY_WIDTH

  // 초기 스크롤: 여행 시작일이 보이도록
  useEffect(() => {
    if (hasScrolled.current) return
    const container = containerRef.current
    if (!container || !planStart || !timelineStart) return
    const offsetDays = Math.round((planStart.getTime() - timelineStart.getTime()) / DAY_MS)
    const scrollTarget = offsetDays * DAY_WIDTH - 40
    container.scrollLeft = Math.max(0, scrollTarget)
    hasScrolled.current = true
  }, [planStart, timelineStart])

  const getEventStyle = useCallback((event: TimelineEvent) => {
    if (totalMs === 0) return { left: 0, width: 0 }
    const left = ((event.startMs - timelineStartMs) / totalMs) * totalWidth
    const minWidth = event.type === 'flight' ? 24 : 4
    const width = Math.max(((event.endMs - event.startMs) / totalMs) * totalWidth, minWidth)
    return { left, width }
  }, [timelineStartMs, totalMs, totalWidth])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    setIsDragging(true)
    dragState.current = { startX: e.pageX, scrollLeft: container.scrollLeft }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const container = containerRef.current
    if (!container) return
    e.preventDefault()
    const dx = e.pageX - dragState.current.startX
    container.scrollLeft = dragState.current.scrollLeft - dx
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (!planStart || !planEnd || days.length === 0) {
    return null
  }

  const rowCount = flightRows.length + accEvents.length

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white">
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-thin"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {/* 날짜 행 */}
          <div className="flex border-b border-gray-200">
            {days.map((day) => {
              const isToday = isSameDay(day, today)
              const inPlan = isInRange(day, planStart, planEnd)
              let bg = ''
              if (isToday) bg = 'bg-blue-50'
              else if (inPlan) bg = 'bg-amber-50'
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-shrink-0 border-r border-gray-100 px-1 py-2 text-center last:border-r-0 ${bg}`}
                  style={{ width: DAY_WIDTH }}
                >
                  <div className={`text-xs font-medium ${
                    isToday ? 'text-blue-600' : inPlan ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getMonth() + 1}/{day.getDate()}
                  </div>
                  <div className={`text-[10px] ${
                    isToday ? 'text-blue-400' : inPlan ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {WEEKDAYS[day.getDay()]}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 이벤트 영역 */}
          <div className="relative px-0 py-2" style={{ minHeight: 28 * rowCount + 8 }}>
            {/* 날짜 구분선 */}
            {days.map((day, i) => {
              const inPlan = isInRange(day, planStart, planEnd)
              return (
                <div
                  key={`grid-${day.toISOString()}`}
                  className={`absolute top-0 bottom-0 border-r ${inPlan ? 'border-gray-100' : 'border-gray-50'}`}
                  style={{ left: (i + 1) * DAY_WIDTH }}
                />
              )
            })}

            {/* 비행기 이벤트: 1섹션 = 1줄, 세그먼트(출국/입국)를 같은 줄에 배치 */}
            {flightRows.map((row, rowIdx) => {
              const top = 4 + rowIdx * 28
              const elements: React.ReactNode[] = []

              row.segments.forEach((seg) => {
                const { left, width } = getEventStyle(seg)
                elements.push(
                  <div
                    key={seg.id}
                    className="absolute flex items-center rounded-md bg-blue-100 px-2 text-[11px] font-medium text-blue-700 shadow-sm"
                    style={{ left, width, top, height: 22 }}
                    title={seg.label}
                  >
                    <span>&#9992;</span>
                  </div>,
                )

              })

              return elements
            })}

            {/* 숙소 이벤트 */}
            {accEvents.map((event, i) => {
              const { left, width } = getEventStyle(event)
              return (
                <div
                  key={event.id}
                  className="absolute flex items-center rounded-md bg-purple-100 px-2 text-[11px] font-medium text-purple-700 shadow-sm"
                  style={{
                    left,
                    width,
                    top: 4 + (flightRows.length + i) * 28,
                    height: 22,
                  }}
                  title={event.label}
                >
                  <span className="truncate">
                    <span className="mr-1">&#127976;</span>
                    {event.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
