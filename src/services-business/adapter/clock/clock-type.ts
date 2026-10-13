export type ClockService = Readonly<{ now: () => Date }>;
export type IdentityService = Readonly<{ id: () => string; random: () => number }>;
