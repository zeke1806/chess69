import { createApplicationService } from './application/application-service';
import type { ApplicationService, ApplicationDependencies } from './application/application-type';
import { createReactService } from './adapter/react/react-service';
import type { ReactService } from './adapter/react/react-type';

export type ServicesFront = Readonly<{ applicationService: ApplicationService; reactService: ReactService }>;
type ServicesFrontDependencies = Readonly<{ version: string; business: Omit<ApplicationDependencies, 'version'> }>;
export const createServicesFront = ({version,business}:ServicesFrontDependencies):ServicesFront => ({
  applicationService: createApplicationService({...business,version}),
  reactService:createReactService(),
});
