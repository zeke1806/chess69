import type {
  InstallationCheckFrontDependencies,
  InstallationCheckFrontService,
  InstallationCheckFrontSnapshot,
} from './installation-check-type';

export const createInstallationCheckFrontService = (
  { version }: InstallationCheckFrontDependencies,
): InstallationCheckFrontService => {
  let snapshot: InstallationCheckFrontSnapshot = Object.freeze({
    version,
    status: 'ready',
    message: 'Prêt à tester',
  });
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    testInteraction: () => {
      if (snapshot.status === 'confirmed') return;

      snapshot = Object.freeze({
        version,
        status: 'confirmed',
        message: 'Interaction confirmée',
      });
      listeners.forEach((listener) => { listener(); });
    },
  };
};
