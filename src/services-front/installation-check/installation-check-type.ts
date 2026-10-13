export type InstallationCheckFrontSnapshot = Readonly<{
  version: string;
  status: 'ready' | 'confirmed';
  message: string;
}>;

export interface InstallationCheckFrontService {
  getSnapshot: () => InstallationCheckFrontSnapshot;
  subscribe: (listener: () => void) => () => void;
  testInteraction: () => void;
}

export type InstallationCheckFrontDependencies = Readonly<{
  version: string;
}>;
