import { useRef, useState, useCallback, useMemo, useEffect, memo } from 'react'
import type { TravelPlan, PlanSection } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { usePendingChangesStore } from '@/stores/usePendingChangesStore'

interface PlanTimelineProps {
  plan: TravelPlan;
  isEditMode?: boolean;
}

interface TooltipDetail {
  label: string;
  value: string;
}

type TimelineEvent = {
  id: string;
  type: 'flight' | 'accommodation' | 'activity';
  label: string;
  startMs: number;
  endMs: number;
  details: TooltipDetail[];
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

/** 날짜 전용 문자열("YYYY-MM-DD")을 로컬 자정으로 파싱 */
function parseDateLocal(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
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

      const details: TooltipDetail[] = []
      if (leg.airline) details.push({ label: '항공사', value: leg.airline })
      if (leg.flightNumber) details.push({ label: '편명', value: leg.flightNumber })
      details.push({ label: '출발', value: `${leg.departureAirport} ${formatDateTime(leg.departureTime)}` })
      details.push({ label: '도착', value: `${leg.arrivalAirport} ${formatDateTime(leg.arrivalTime)}` })
      if (leg.bookingReference) details.push({ label: '예약번호', value: leg.bookingReference })
      if (f.price != null) details.push({ label: '가격', value: `${f.price.toLocaleString()}원` })

      events.push({
        id: `${section.id}-leg-${leg.legOrder}`,
        type: 'flight',
        label: leg.flightNumber || leg.airline || section.title,
        startMs: dep.getTime(),
        endMs: arr.getTime(),
        details,
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

    const details: TooltipDetail[] = [
      { label: '숙소명', value: a.name },
    ]
    if (a.address) details.push({ label: '주소', value: a.address })
    details.push({ label: '체크인', value: formatDateTime(a.checkIn) })
    details.push({ label: '체크아웃', value: formatDateTime(a.checkOut) })
    if (a.bookingReference) details.push({ label: '예약번호', value: a.bookingReference })
    if (a.contactNumber) details.push({ label: '연락처', value: a.contactNumber })
    if (a.price != null) details.push({ label: '가격', value: `${a.price.toLocaleString()}원` })

    events.push({
      id: `${section.id}-acc`,
      type: 'accommodation',
      label: a.name || section.title,
      startMs: checkIn.getTime(),
      endMs: checkOut.getTime(),
      details,
    })
  }

  return events
}

function extractActivityEvents(sections: PlanSection[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const section of sections) {
    if (section.type !== 'activity' || !section.activityInfo || !section.confirmed) continue
    const a = section.activityInfo
    const start = parseDate(a.startTime ?? '')
    const end = parseDate(a.endTime ?? '')
    if (!start || !end) continue

    const details: TooltipDetail[] = [
      { label: '액티비티', value: a.name },
    ]
    if (a.location) details.push({ label: '위치', value: a.location })
    details.push({ label: '시작', value: formatDateTime(a.startTime!) })
    details.push({ label: '종료', value: formatDateTime(a.endTime!) })
    if (a.price != null) details.push({ label: '가격', value: `${a.price.toLocaleString()}원` })
    if (a.notes) details.push({ label: '메모', value: a.notes })

    events.push({
      id: `${section.id}-activity`,
      type: 'activity',
      label: a.name || section.title,
      startMs: start.getTime(),
      endMs: end.getTime(),
      details,
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

// --- Detail panel ---

const TYPE_LABELS: Record<TimelineEvent['type'], string> = {
  flight: '비행기 정보',
  accommodation: '숙소 정보',
  activity: '액티비티 정보',
}

const TYPE_BADGE_COLORS: Record<TimelineEvent['type'], string> = {
  flight: 'bg-blue-100 text-blue-700',
  accommodation: 'bg-purple-100 text-purple-700',
  activity: 'bg-orange-100 text-orange-700',
}

const TYPE_ICONS: Record<TimelineEvent['type'], string> = {
  flight: '\u2708',
  accommodation: '\uD83C\uDFE8',
  activity: '\uD83C\uDFAF',
}

const EventDetailPanel = memo(function EventDetailPanel({
  event,
  onClose,
}: {
  event: TimelineEvent;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-gray-200 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE_COLORS[event.type]}`}>
            <span>{TYPE_ICONS[event.type]}</span>
            {TYPE_LABELS[event.type]}
          </span>
          <span className="text-sm font-medium text-gray-800">{event.label}</span>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        {event.details.map((d, i) => (
          <div key={i} className="col-span-2 grid grid-cols-subgrid">
            <dt className="font-medium text-gray-500">{d.label}</dt>
            <dd className="text-gray-700">{d.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
})

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
  onClick,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute flex cursor-pointer items-center rounded-md bg-blue-100 px-2 text-[11px] font-medium text-blue-700 shadow-sm hover:bg-blue-200"
      style={{ left, width, top: 4, height: 22 }}
      onClick={onClick}
    >
      <span className="truncate">
        <span className="mr-1">&#9992;</span>
        {event.label}
      </span>
    </div>
  )
})

const AccommodationEventItem = memo(function AccommodationEventItem({
  event,
  left,
  width,
  top,
  onClick,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
  top: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute flex cursor-pointer items-center rounded-md bg-purple-100 px-2 text-[11px] font-medium text-purple-700 shadow-sm hover:bg-purple-200"
      style={{ left, width, top, height: 22 }}
      onClick={onClick}
    >
      <span className="truncate">
        <span className="mr-1">&#127976;</span>
        {event.label}
      </span>
    </div>
  )
})

const ActivityEventItem = memo(function ActivityEventItem({
  event,
  left,
  width,
  top,
  onClick,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
  top: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute flex cursor-pointer items-center rounded-md bg-orange-100 px-2 text-[11px] font-medium text-orange-700 shadow-sm hover:bg-orange-200"
      style={{ left, width, top, height: 22 }}
      onClick={onClick}
    >
      <span className="truncate">
        <span className="mr-1">&#127919;</span>
        {event.label}
      </span>
    </div>
  )
})

function mergePendingSections(
  baseSections: PlanSection[],
  pendingSections: Map<string, { title?: string; confirmed?: boolean; flightInfo?: unknown; accommodationInfo?: unknown; activityInfo?: unknown }>,
  newSections: PlanSection[],
  deletedSectionIds: Set<string>,
): PlanSection[] {
  const existing = baseSections
    .filter((s) => !deletedSectionIds.has(s.id))
    .map((s) => {
      const pending = pendingSections.get(s.id)
      if (!pending) return s
      const merged = { ...s }
      if (pending.title !== undefined) merged.title = pending.title
      if (pending.confirmed !== undefined) merged.confirmed = pending.confirmed
      if (pending.flightInfo && s.type === 'flight') {
        const f = pending.flightInfo as Partial<PlanSection['flightInfo']> & Record<string, unknown>
        if (s.flightInfo) {
          merged.flightInfo = { ...s.flightInfo, ...f } as PlanSection['flightInfo']
        }
      }
      if (pending.accommodationInfo && s.type === 'accommodation') {
        const a = pending.accommodationInfo as Record<string, unknown>
        if (s.accommodationInfo) {
          merged.accommodationInfo = { ...s.accommodationInfo, ...a } as PlanSection['accommodationInfo']
        } else {
          merged.accommodationInfo = { id: s.id, name: '', address: '', checkIn: '', checkOut: '', ...a } as PlanSection['accommodationInfo']
        }
      }
      if (pending.activityInfo && s.type === 'activity') {
        const a = pending.activityInfo as Record<string, unknown>
        if (s.activityInfo) {
          merged.activityInfo = { ...s.activityInfo, ...a } as PlanSection['activityInfo']
        } else {
          merged.activityInfo = { id: s.id, name: '', ...a } as PlanSection['activityInfo']
        }
      }
      return merged
    })

  // new sections: 폼 데이터가 있으면 머지
  const added = newSections.map((s) => {
    const pending = pendingSections.get(s.id)
    if (!pending) return s
    const merged = { ...s }
    if (pending.title !== undefined) merged.title = pending.title
    if (pending.confirmed !== undefined) merged.confirmed = pending.confirmed
    if (pending.activityInfo && s.type === 'activity') {
      merged.activityInfo = { id: s.id, name: '', ...(pending.activityInfo as Record<string, unknown>) } as PlanSection['activityInfo']
    }
    if (pending.accommodationInfo && s.type === 'accommodation') {
      merged.accommodationInfo = { id: s.id, name: '', address: '', checkIn: '', checkOut: '', ...(pending.accommodationInfo as Record<string, unknown>) } as PlanSection['accommodationInfo']
    }
    if (pending.flightInfo && s.type === 'flight') {
      merged.flightInfo = { id: s.id, tripType: 'oneWay', legs: [], ...(pending.flightInfo as Record<string, unknown>) } as PlanSection['flightInfo']
    }
    return merged
  })

  return [...existing, ...added]
}

export function PlanTimeline({ plan, isEditMode = false }: PlanTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const dragState = useRef({ startX: 0, scrollLeft: 0 })
  const hasScrolled = useRef(false)

  const pendingSectionsMap = usePendingChangesStore((s) => s.sections)
  const pendingNewSections = usePendingChangesStore((s) => s.newSections)
  const pendingDeletedIds = usePendingChangesStore((s) => s.deletedSectionIds)

  const workingSections = useMemo(() => {
    if (!isEditMode) return plan.sections
    return mergePendingSections(plan.sections, pendingSectionsMap, pendingNewSections, pendingDeletedIds)
  }, [isEditMode, plan.sections, pendingSectionsMap, pendingNewSections, pendingDeletedIds])

  const planStart = useMemo(() => parseDateLocal(plan.startDate), [plan.startDate])
  const planEnd = useMemo(() => parseDateLocal(plan.endDate), [plan.endDate])

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

  const flightEvents = useMemo(() => extractFlightEvents(workingSections), [workingSections])
  const accEvents = useMemo(() => extractAccEvents(workingSections), [workingSections])
  const activityEvents = useMemo(() => extractActivityEvents(workingSections), [workingSections])

  // 선택된 이벤트를 최신 데이터에서 조회 (수정모드에서 실시간 반영)
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return (
      flightEvents.find((e) => e.id === selectedEventId)
      ?? accEvents.find((e) => e.id === selectedEventId)
      ?? activityEvents.find((e) => e.id === selectedEventId)
      ?? null
    )
  }, [selectedEventId, flightEvents, accEvents, activityEvents])

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

  const handleEventClick = useCallback((event: TimelineEvent, e: React.MouseEvent) => {
    // 드래그 중에는 클릭 무시
    const dx = Math.abs(e.pageX - dragState.current.startX)
    if (dx > 4) return

    e.stopPropagation()

    // 이미 같은 이벤트가 열려 있으면 닫기
    setSelectedEventId((prev) => prev === event.id ? null : event.id)
  }, [])

  const closeDetailPanel = useCallback(() => setSelectedEventId(null), [])

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
  const hasActivities = activityEvents.length > 0
  const rowCount = (hasFlights ? 1 : 0) + (hasAccommodations ? 1 : 0) + (hasActivities ? 1 : 0)

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
                  onClick={(e) => handleEventClick(seg, e)}
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
                  onClick={(e) => handleEventClick(event, e)}
                />
              )
            })}

            {/* 액티비티 이벤트 */}
            {activityEvents.map((event) => {
              const { left, width } = getEventStyle(event)
              return (
                <ActivityEventItem
                  key={event.id}
                  event={event}
                  left={left}
                  width={width}
                  top={4 + ((hasFlights ? 1 : 0) + (hasAccommodations ? 1 : 0)) * 28}
                  onClick={(e) => handleEventClick(event, e)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* 하단 상세 패널 */}
      {selectedEvent && (
        <EventDetailPanel event={selectedEvent} onClose={closeDetailPanel} />
      )}
    </div>
  )
}
