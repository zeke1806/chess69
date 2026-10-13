import { expect, test } from '@jest/globals';
import { localDay } from '../../src/services-business/calendar/calendar-service';

test('les activités utilisent le jour civil local, y compris autour du changement d’année', () => {
  expect(localDay(new Date(2026, 9, 13, 0, 5))).toBe('2026-10-13');
  expect(localDay(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  expect(localDay(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01');
});
