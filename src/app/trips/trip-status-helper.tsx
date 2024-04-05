import { addDays, setDay, setHours, setMinutes, setSeconds } from 'date-fns';

export function getStatusBadge(start?: Date | null, end?: Date | null) {
  const badges = {
    "planning": <div className="badge badge-outline badge-neutral">Planning</div>,
    "completed": <div className="badge badge-outline badge-success">Completed</div>,
    "upcoming": <div className="badge badge-outline badge-primary">Upcoming</div>,
    "active": <div className="badge badge-outline badge-accent">Active</div>
  }
  return badges[getStatus(start, end)]
};

export function getStatus(start?: Date | null, end?: Date | null) {
  if (!start || !end) return "planning"
  if (end < new Date()) return "completed"
  if (start > new Date()) return "upcoming"
  return "active"
}

export function fromTimeString(time: string) {
  const [hours, minutes, seconds] = time.split(':')
  if (!hours || !minutes || !seconds) return null
  if (hours.length !== 2 || minutes.length !== 2 || seconds.length !== 2) return null
  return {
    hours: +hours, minutes: +minutes, seconds: +seconds
  }
}

export function isActiveStop(start: Date, ordinalDay: number, startTimeStr: string, endTimeStr: string) {
  const now = new Date()
  const startTime = fromTimeString(startTimeStr)
  const endTime = fromTimeString(endTimeStr)

  if (!startTime || !endTime || !start) return false

  let startDate = addDays(start, ordinalDay - 1)
  let endDate = addDays(start, ordinalDay - 1)

  startDate = setHours(startDate, startTime.hours);
  startDate = setMinutes(startDate, startTime.minutes);
  startDate = setSeconds(startDate, startTime.seconds);

  endDate = setHours(endDate, endTime.hours);
  endDate = setMinutes(endDate, endTime.minutes);
  endDate = setSeconds(endDate, endTime.seconds);

  const result = startDate <= now && now < endDate
  return result
}