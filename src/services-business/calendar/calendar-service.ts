import type { LocalDayFormatter } from './calendar-types';
/** Pure calendar convention shared by exercises, finished games and streaks. */
export const localDay: LocalDayFormatter = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
