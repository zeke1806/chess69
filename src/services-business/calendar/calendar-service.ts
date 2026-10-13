import type { LocalDayFormatter } from './calendar-type';

/** Pure calendar convention shared by exercises, finished games and streaks. */
export const localDay: LocalDayFormatter = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
