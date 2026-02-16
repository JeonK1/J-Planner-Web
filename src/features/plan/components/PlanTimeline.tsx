import { useRef, useState, useCallback, useMemo, useEffect, memo } from 'react'
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

interface DayInfo {
  date: Date;
  key: string;
  isToday: boolean;
  inPlan: boolean;
  month: number;
  dayOfMonth: number;
  weekday: string;
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

function extractFlightEvents(sections: PlanSection[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const section of sections) {
    if (section.type !== 'flight' || !section.flightInfo || !section.confirmed) continue
    const f = section.flightInfo

    for (const leg of f.legs) {
      const dep = parseDate(leg.departureTime)
      const arr = parseDate(leg.arrivalTime)
      if (!dep || !arr) continue

      events.push({
        id: `${section.id}-leg-${leg.legOrder}`,
        type: 'flight',
        label: leg.flightNumber || leg.airline || section.title,
        startMs: dep.getTime(),
        endMs: arr.getTime(),
      })
    }
  }

  return events
}

function extractAccEvents(sections: PlanSection[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const section of sections) {
    if (section.type !== 'accommodation' || !section.accommodationInfo || !section.confirmed) continue
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

// --- Memoized sub-components ---

const TimelineDayCell = memo(function TimelineDayCell({
  day,
}: {
  day: DayInfo;
}) {
  let bg = ''
  if (day.isToday) bg = 'bg-blue-50'
  else if (day.inPlan) bg = 'bg-amber-50'

  return (
    <div
      className={`flex-shrink-0 border-r border-gray-100 px-1 py-2 text-center last:border-r-0 ${bg}`}
      style={{ width: DAY_WIDTH }}
    >
      <div className={`text-xs font-medium ${
        day.isToday ? 'text-blue-600' : day.inPlan ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {day.month}/{day.dayOfMonth}
      </div>
      <div className={`text-[10px] ${
        day.isToday ? 'text-blue-400' : day.inPlan ? 'text-gray-500' : 'text-gray-300'
      }`}>
        {day.weekday}
      </div>
    </div>
  )
})

const FlightEventItem = memo(function FlightEventItem({
  event,
  left,
  width,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
}) {
  return (
    <div
      className="absolute flex items-center rounded-md bg-blue-100 px-2 text-[11px] font-medium text-blue-700 shadow-sm"
      style={{ left, width, top: 4, height: 22 }}
      title={event.label}
    >
      <span>&#9992;</span>
    </div>
  )
})

const AccommodationEventItem = memo(function AccommodationEventItem({
  event,
  left,
  width,
  top,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
  top: number;
}) {
  return (
    <div
      className="absolute flex items-center rounded-md bg-purple-100 px-2 text-[11px] font-medium text-purple-700 shadow-sm"
      style={{ left, width, top, height: 22 }}
      title={event.label}
    >
      <span className="truncate">
        <span className="mr-1">&#127976;</span>
        {event.label}
      </span>
    </div>
  )
})

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

  const flightEvents = useMemo(() => extractFlightEvents(plan.sections), [plan.sections])
  const accEvents = useMemo(() => extractAccEvents(plan.sections), [plan.sections])

  const today = useMemo(() => new Date(), [])

  // Pre-compute day info to avoid recalculating isToday/inPlan every render
  const dayInfos = useMemo<DayInfo[]>(() => {
    if (!planStart || !planEnd) return []
    return days.map((day) => ({
      date: day,
      key: day.toISOString(),
      isToday: isSameDay(day, today),
      inPlan: isInRange(day, planStart, planEnd),
      month: day.getMonth() + 1,
      dayOfMonth: day.getDate(),
      weekday: WEEKDAYS[day.getDay()],
    }))
  }, [days, today, planStart, planEnd])

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

  const hasFlights = flightEvents.length > 0
  const hasAccommodations = accEvents.length > 0
  const rowCount = (hasFlights ? 1 : 0) + (hasAccommodations ? 1 : 0)

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
            {dayInfos.map((day) => (
              <TimelineDayCell key={day.key} day={day} />
            ))}
          </div>

          {/* 이벤트 영역 */}
          <div className="relative px-0 py-2" style={{ minHeight: 28 * rowCount + 8 }}>
            {/* 날짜 구분선 */}
            {dayInfos.map((day, i) => (
              <div
                key={`grid-${day.key}`}
                className={`absolute top-0 bottom-0 border-r ${day.inPlan ? 'border-gray-100' : 'border-gray-50'}`}
                style={{ left: (i + 1) * DAY_WIDTH }}
              />
            ))}

            {/* 비행기 이벤트 */}
            {flightEvents.map((seg) => {
              const { left, width } = getEventStyle(seg)
              return (
                <FlightEventItem
                  key={seg.id}
                  event={seg}
                  left={left}
                  width={width}
                />
              )
            })}

            {/* 숙소 이벤트 */}
            {accEvents.map((event) => {
              const { left, width } = getEventStyle(event)
              return (
                <AccommodationEventItem
                  key={event.id}
                  event={event}
                  left={left}
                  width={width}
                  top={4 + (hasFlights ? 1 : 0) * 28}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
