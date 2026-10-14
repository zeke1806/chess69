export type IdentityService = Readonly<{
  id: () => string;
  random: () => number;
}>;
