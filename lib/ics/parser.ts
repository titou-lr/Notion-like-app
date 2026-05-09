import ICAL from "ical.js";

export interface ParsedEvent {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  isRecurring: boolean;
  recurrence?: string;
}

export interface ParseIcsResult {
  events: ParsedEvent[];
  errors: string[];
}

function toUtcDate(time: ICAL.Time): Date {
  if (time.isDate) {
    // All-day event: interpret as midnight UTC
    const js = time.toJSDate();
    return new Date(Date.UTC(js.getFullYear(), js.getMonth(), js.getDate()));
  }
  return time.convertToZone(ICAL.Timezone.utcTimezone).toJSDate();
}

export function parseIcs(icsContent: string): ParseIcsResult {
  const errors: string[] = [];
  const events: ParsedEvent[] = [];

  let jcalData: unknown[];
  try {
    jcalData = ICAL.parse(icsContent);
  } catch (err) {
    return { events: [], errors: [`Failed to parse ICS: ${(err as Error).message}`] };
  }

  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");

  for (const vevent of vevents) {
    try {
      const event = new ICAL.Event(vevent);

      const title = event.summary?.trim();
      if (!title) {
        errors.push("Skipping event with no SUMMARY");
        continue;
      }

      const startAt = toUtcDate(event.startDate);
      const endAt = toUtcDate(event.endDate);

      const isRecurring = event.isRecurring();
      let recurrence: string | undefined;
      if (isRecurring && vevent.hasProperty("rrule")) {
        const rrule = vevent.getFirstPropertyValue<ICAL.Recur>("rrule");
        recurrence = rrule.toString();
      }

      const description = event.description?.trim() || undefined;

      events.push({ title, description, startAt, endAt, isRecurring, recurrence });
    } catch (err) {
      errors.push(`Skipping malformed VEVENT: ${(err as Error).message}`);
    }
  }

  return { events, errors };
}
