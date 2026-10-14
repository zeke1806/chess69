export interface IdentityService {
  readonly id: () => string;
  readonly random: () => number;
}
