import type {
  InstallationCheckFrontService,
  InstallationCheckFrontSnapshot,
} from '../../installation-check/installation-check-type';

export interface ReactService {
  useInstallationCheckState: (
    service: InstallationCheckFrontService,
  ) => InstallationCheckFrontSnapshot;
}
