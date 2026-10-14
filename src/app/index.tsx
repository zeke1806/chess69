import { useState } from 'react';
import { ApplicationFeature } from '../ui/features/application-feature';
import { useServicesFront } from '../ui/features/services-provider';

export default function ApplicationRoute() {
  const services = useServicesFront();
  const [service] = useState(services.orchestration.createOrchestrationService);
  return <ApplicationFeature service={service} />;
}
