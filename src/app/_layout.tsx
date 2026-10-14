import { createServicesBusiness } from '../services-business/di';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import appConfig from '../../app.json';
import { createServicesFront } from '../services/di';
import { ServicesFrontProvider } from '../ui/features/services-provider';

export default function RootLayout() {
  const [servicesFront] = useState(() =>
    createServicesFront({
      version: appConfig.expo.version,
      business: createServicesBusiness(),
    }),
  );

  return (
    <ServicesFrontProvider servicesFront={servicesFront}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#111318' },
        }}
      />
    </ServicesFrontProvider>
  );
}
