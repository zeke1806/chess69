/** Civil day in the installation's current timezone, formatted YYYY-MM-DD. */
export type LocalDay = string;
export type LocalDayFormatter = (date: Date) => LocalDay;
