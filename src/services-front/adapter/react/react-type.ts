import type { ApplicationService, ApplicationSnapshot } from '../../application/application-type';
export type ReactService = Readonly<{ useApplicationState: (service: ApplicationService) => ApplicationSnapshot }>;
