import { createServicesBusiness } from '../services-business/dependency-injection';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import appConfig from '../../app.json';
import { createServicesFront } from '../services-front/dependency-injection';
import { ServicesFrontProvider } from '../ui/features/services-front-provider';

export default function RootLayout() {
  const [servicesFront] = useState(() => createServicesFront({
    version: appConfig.expo.version,
    business: createServicesBusiness(),
  }));

  useEffect(() => () => { void servicesFront.applicationService.dispose().catch(() => {}); }, [servicesFront]);

  return (
    <ServicesFrontProvider servicesFront={servicesFront}>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#111318' },
      }} />
    </ServicesFrontProvider>
  );
}
