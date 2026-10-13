import { createReactService } from './adapter/react/react-service';
import type { ReactService } from './adapter/react/react-type';
import { createInstallationCheckFrontService } from './installation-check/installation-check-service';
import type { InstallationCheckFrontService } from './installation-check/installation-check-type';

export type ServicesFront = Readonly<{
  installationCheckFrontService: InstallationCheckFrontService;
  reactService: ReactService;
}>;

type ServicesFrontDependencies = Readonly<{
  version: string;
}>;

export const createServicesFront = (
  { version }: ServicesFrontDependencies,
): ServicesFront => ({
  installationCheckFrontService: createInstallationCheckFrontService({ version }),
  reactService: createReactService(),
});
