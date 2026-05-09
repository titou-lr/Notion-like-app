declare module "ical.js" {
  function parse(input: string): unknown[];

  class Component {
    constructor(jCal: unknown);
    getAllSubcomponents(name: string): Component[];
    getFirstPropertyValue<T = unknown>(name: string): T;
    hasProperty(name: string): boolean;
  }

  class Event {
    constructor(component: Component);
    summary: string;
    description: string;
    startDate: Time;
    endDate: Time;
    isRecurring(): boolean;
  }

  class Time {
    isDate: boolean;
    zone: Timezone;
    toJSDate(): Date;
    toUnixTime(): number;
    convertToZone(zone: Timezone): Time;
    clone(): Time;
  }

  class Timezone {
    static utcTimezone: Timezone;
    static localTimezone: Timezone;
  }

  class Recur {
    freq: string;
    toString(): string;
  }
}
