import { InstallationCheckFeature } from '../ui/features/installation-check-feature';
import { useServicesFront } from '../ui/features/services-front-provider';

export default function InstallationCheckRoute() {
  return <InstallationCheckFeature servicesFront={useServicesFront()} />;
}
