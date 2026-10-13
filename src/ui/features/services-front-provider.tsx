import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import type { ServicesFront } from '../../services-front/dependency-injection';

const ServicesFrontContext = createContext<ServicesFront | null>(null);

export const ServicesFrontProvider = (
  { servicesFront, children }: PropsWithChildren<Readonly<{
    servicesFront: ServicesFront;
  }>>,
) => (
  <ServicesFrontContext.Provider value={servicesFront}>
    {children}
  </ServicesFrontContext.Provider>
);

export function useServicesFront(): ServicesFront {
  const servicesFront = useContext(ServicesFrontContext);

  if (!servicesFront) {
    throw new Error('ServicesFrontProvider doit entourer les routes de l’application.');
  }

  return servicesFront;
}
