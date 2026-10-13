import type { ServicesFront } from '../../services-front/dependency-injection';
import { InstallationCheck } from '../components/installation-check';

export const InstallationCheckFeature = (
  { servicesFront }: Readonly<{ servicesFront: ServicesFront }>,
) => {
  const { installationCheckFrontService, reactService } = servicesFront;
  const snapshot = reactService.useInstallationCheckState(installationCheckFrontService);

  return (
    <InstallationCheck
      version={snapshot.version}
      message={snapshot.message}
      confirmed={snapshot.status === 'confirmed'}
      onTest={installationCheckFrontService.testInteraction}
    />
  );
};
